import type {
	ApiErrorCode,
	ApiErrorDetails,
	ApiErrorResponse,
	ApiValidationRuleCode,
} from "@ecommand/shared";
import { API_ERROR_CODES, API_VALIDATION_RULE_CODES } from "@ecommand/shared";
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import type { ValidationError } from "class-validator";
import type { Response } from "express";
import { constraintHandlers } from "../database/constraints";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function codeForStatus(status: number): ApiErrorCode {
	switch (status) {
		case HttpStatus.UNAUTHORIZED:
			return API_ERROR_CODES.AUTHENTICATION_REQUIRED;
		case HttpStatus.FORBIDDEN:
			return API_ERROR_CODES.ACCESS_DENIED;
		case HttpStatus.NOT_FOUND:
			return API_ERROR_CODES.RESOURCE_NOT_FOUND;
		case HttpStatus.CONFLICT:
		case HttpStatus.UNPROCESSABLE_ENTITY:
			return API_ERROR_CODES.CONFLICT;
		case HttpStatus.TOO_MANY_REQUESTS:
			return API_ERROR_CODES.RATE_LIMITED;
		case HttpStatus.BAD_REQUEST:
			return API_ERROR_CODES.VALIDATION_FAILED;
		default:
			return status >= HttpStatus.INTERNAL_SERVER_ERROR
				? API_ERROR_CODES.INTERNAL_ERROR
				: API_ERROR_CODES.REQUEST_FAILED;
	}
}

function isApiErrorCode(value: unknown): value is ApiErrorCode {
	return (
		typeof value === "string" &&
		Object.values(API_ERROR_CODES).includes(value as ApiErrorCode)
	);
}

function isApiValidationRuleCode(
	value: unknown,
): value is ApiValidationRuleCode {
	return (
		typeof value === "string" &&
		Object.values(API_VALIDATION_RULE_CODES).includes(
			value as ApiValidationRuleCode,
		)
	);
}

function toErrorDetails(value: unknown): ApiErrorDetails | undefined {
	if (!isRecord(value)) return undefined;

	const details: ApiErrorDetails = {};
	if (isRecord(value.fields)) {
		const fields = Object.fromEntries(
			Object.entries(value.fields).flatMap(([field, rules]) => {
				if (!Array.isArray(rules)) return [];
				const codes = rules.filter(isApiValidationRuleCode);
				return codes.length > 0 ? [[field, codes]] : [];
			}),
		);
		if (Object.keys(fields).length > 0) details.fields = fields;
	}
	if (
		Array.isArray(value.permissions) &&
		value.permissions.every((permission) => typeof permission === "string")
	) {
		details.permissions = value.permissions;
	}

	return Object.keys(details).length > 0 ? details : undefined;
}

export function toErrorResponse(
	statusCode: number,
	response: unknown,
): ApiErrorResponse {
	const body = isRecord(response) ? response : undefined;
	const code = isApiErrorCode(body?.code)
		? body.code
		: codeForStatus(statusCode);
	const details = toErrorDetails(body?.details);

	return {
		code,
		statusCode,
		...(details !== undefined && { details }),
	};
}

export function toValidationDetails(errors: ValidationError[]) {
	const fields: Record<string, ApiValidationRuleCode[]> = {};
	const visit = (error: ValidationError, path: string) => {
		const field = path ? `${path}.${error.property}` : error.property;
		if (error.constraints) {
			fields[field] = Object.keys(error.constraints).map((name) => {
				const code = name
					.replace(/[A-Z]/g, (letter) => `_${letter}`)
					.toUpperCase();
				return Object.values(API_VALIDATION_RULE_CODES).includes(
					code as ApiValidationRuleCode,
				)
					? (code as ApiValidationRuleCode)
					: API_VALIDATION_RULE_CODES.UNKNOWN;
			});
		}
		for (const child of error.children ?? []) visit(child, field);
	};
	for (const error of errors) visit(error, "");
	return { fields };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const constraint = findDatabaseConstraint(exception);
		const constraintHandler =
			constraint && Object.hasOwn(constraintHandlers, constraint)
				? constraintHandlers[constraint]
				: undefined;
		if (constraintHandler) {
			const { statusCode, code } = constraintHandler({});
			const response = host.switchToHttp().getResponse<Response>();
			response.status(statusCode).json(toErrorResponse(statusCode, { code }));
			return;
		}

		const isHttpException = exception instanceof HttpException;
		const statusCode = isHttpException
			? exception.getStatus()
			: HttpStatus.INTERNAL_SERVER_ERROR;
		const exceptionBody = isHttpException ? exception.getResponse() : undefined;
		const response = host.switchToHttp().getResponse<Response>();
		response
			.status(statusCode)
			.json(toErrorResponse(statusCode, exceptionBody));
	}
}

function findDatabaseConstraint(exception: unknown): string | undefined {
	const seen = new Set<object>();
	let current = exception;

	while (isRecord(current) && !seen.has(current)) {
		seen.add(current);
		if (typeof current.constraint === "string") return current.constraint;
		current = current.cause;
	}

	return undefined;
}
