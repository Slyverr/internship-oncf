import { API_ERROR_CODES } from "@ecommand/shared";
import { HttpStatus } from "@nestjs/common";
import type { ValidationError } from "class-validator";
import {
	codeForStatus,
	toErrorResponse,
	toValidationDetails,
} from "./api-exception.filter";

describe("API error response contract", () => {
	it("returns stable codes for standard HTTP failures", () => {
		expect(codeForStatus(HttpStatus.UNAUTHORIZED)).toBe(
			API_ERROR_CODES.AUTHENTICATION_REQUIRED,
		);
		expect(codeForStatus(HttpStatus.CONFLICT)).toBe(API_ERROR_CODES.CONFLICT);
		expect(codeForStatus(HttpStatus.INTERNAL_SERVER_ERROR)).toBe(
			API_ERROR_CODES.INTERNAL_ERROR,
		);
	});

	it("preserves domain codes and approved structured details without forwarding messages", () => {
		expect(
			toErrorResponse(HttpStatus.CONFLICT, {
				code: "DUPLICATE_ORDER_NUMBER",
				message: "A sensitive or localized message",
				details: {
					fields: { orderNumber: ["IS_NOT_EMPTY"] },
					permissions: ["users:create"],
				},
			}),
		).toEqual({
			code: "DUPLICATE_ORDER_NUMBER",
			statusCode: HttpStatus.CONFLICT,
			details: {
				fields: { orderNumber: ["IS_NOT_EMPTY"] },
				permissions: ["users:create"],
			},
		});
	});

	it("strips prose and unknown data from error details", () => {
		expect(
			toErrorResponse(HttpStatus.BAD_REQUEST, {
				code: API_ERROR_CODES.VALIDATION_FAILED,
				message: "Invalid request",
				details: {
					message: "email must be valid",
					fields: {
						email: ["IS_EMAIL", "not-a-validation-code"],
						password: ["custom message"],
					},
				},
			}),
		).toEqual({
			code: API_ERROR_CODES.VALIDATION_FAILED,
			statusCode: HttpStatus.BAD_REQUEST,
			details: { fields: { email: ["IS_EMAIL"] } },
		});
	});

	it("replaces unknown exception codes with the status fallback", () => {
		expect(
			toErrorResponse(HttpStatus.CONFLICT, { code: "UNREGISTERED_CODE" }),
		).toEqual({
			code: API_ERROR_CODES.CONFLICT,
			statusCode: HttpStatus.CONFLICT,
		});
	});

	it("preserves stable authorization codes without forwarding prose", () => {
		expect(
			toErrorResponse(HttpStatus.FORBIDDEN, {
				code: API_ERROR_CODES.ACCESS_DENIED,
				message: "User lacks required permissions",
			}),
		).toEqual({
			code: API_ERROR_CODES.ACCESS_DENIED,
			statusCode: HttpStatus.FORBIDDEN,
		});
	});

	it("does not expose legacy strings from standard exception bodies", () => {
		expect(
			toErrorResponse(HttpStatus.BAD_REQUEST, {
				statusCode: HttpStatus.BAD_REQUEST,
				message: ["email must be an email"],
				error: "Bad Request",
			}),
		).toEqual({
			code: API_ERROR_CODES.VALIDATION_FAILED,
			statusCode: HttpStatus.BAD_REQUEST,
		});
	});

	it("converts validation rules to field-scoped codes, including nested fields", () => {
		const errors: ValidationError[] = [
			{ property: "email", constraints: { isEmail: "must be an email" } },
			{
				property: "profile",
				children: [
					{
						property: "firstName",
						constraints: { isNotEmpty: "must not be empty" },
					},
				],
			},
			{
				property: "recordId",
				constraints: { isUuid: "must be a UUID" },
			},
		];

		expect(toValidationDetails(errors)).toEqual({
			fields: {
				email: ["IS_EMAIL"],
				"profile.firstName": ["IS_NOT_EMPTY"],
				recordId: ["IS_UUID"],
			},
		});
	});

	it("converts array size validation to a stable rule code", () => {
		expect(
			toValidationDetails([
				{
					property: "permissionNames",
					constraints: { arrayMaxSize: "too many permissions" },
				},
			]),
		).toEqual({ fields: { permissionNames: ["ARRAY_MAX_SIZE"] } });
	});

	it("converts unsupported validator names to a stable fallback code", () => {
		expect(
			toValidationDetails([
				{ property: "value", constraints: { customRule: "not valid" } },
			]),
		).toEqual({ fields: { value: ["UNKNOWN"] } });
	});
});
