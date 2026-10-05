import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { API_ERROR_CODES, API_VALIDATION_RULE_CODES } from "@ecommand/shared";
import type { ArgumentsHost } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";
import type { ValidationError } from "class-validator";
import { ConstraintCode, constraintHandlers } from "../database/constraints";
import {
	ApiExceptionFilter,
	codeForStatus,
	toErrorResponse,
	toValidationDetails,
} from "./api-exception.filter";

async function getSourceFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map((entry) => {
			const path = join(directory, entry.name);
			return entry.isDirectory()
				? getSourceFiles(path)
				: entry.isFile() && entry.name.endsWith(".ts")
					? Promise.resolve([path])
					: Promise.resolve([]);
		}),
	);
	return nested.flat();
}

describe("API error response contract", () => {
	it("maps nested Drizzle constraint errors to the established response", () => {
		const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		const host = {
			switchToHttp: () => ({ getResponse: () => response }),
		} as unknown as ArgumentsHost;
		const exception = new Error("Failed query", {
			cause: new Error("PostgreSQL violation", {
				cause: { constraint: "users_email_key" },
			}),
		});

		new ApiExceptionFilter().catch(exception, host);

		expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
		expect(response.json).toHaveBeenCalledWith({
			code: ConstraintCode.DUPLICATE_USER_EMAIL,
			statusCode: HttpStatus.CONFLICT,
		});
	});

	it("preserves the existing response mapping for every registered constraint", () => {
		for (const [constraint, handler] of Object.entries(constraintHandlers)) {
			const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
			const host = {
				switchToHttp: () => ({ getResponse: () => response }),
			} as unknown as ArgumentsHost;
			const expected = handler({});

			new ApiExceptionFilter().catch(
				new Error("Failed query", {
					cause: { constraint },
				}),
				host,
			);

			expect(response.status).toHaveBeenCalledWith(expected.statusCode);
			expect(response.json).toHaveBeenCalledWith({
				code: expected.code,
				statusCode: expected.statusCode,
			});
		}
	});

	it("keeps unregistered database errors as generic internal errors", () => {
		const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
		const host = {
			switchToHttp: () => ({ getResponse: () => response }),
		} as unknown as ArgumentsHost;

		new ApiExceptionFilter().catch(new Error("database details"), host);

		expect(response.status).toHaveBeenCalledWith(
			HttpStatus.INTERNAL_SERVER_ERROR,
		);
		expect(response.json).toHaveBeenCalledWith({
			code: API_ERROR_CODES.INTERNAL_ERROR,
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
		});
	});

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

	it("maps every API class-validator decorator to a shared stable rule code", async () => {
		const sourceFiles = await getSourceFiles(join(__dirname, ".."));
		const sources = await Promise.all(
			sourceFiles.map((file) => readFile(file, "utf8")),
		);
		const decorators = new Set(
			sources.flatMap((source) =>
				Array.from(
					source.matchAll(
						/@(Array[A-Z][A-Za-z0-9]*|Is[A-Z][A-Za-z0-9]*|Matches|Max(?:Length)?|Min(?:Length)?)\s*\(/g,
					),
					([, match]) => match,
				),
			),
		);
		decorators.delete("IsOptional");
		const knownCodes = new Set(Object.values(API_VALIDATION_RULE_CODES));
		const unmapped = [...decorators].filter((decorator) => {
			const code = decorator
				.replace(/UUID/g, "Uuid")
				.replace(/[A-Z]/g, (letter) => `_${letter}`)
				.replace(/^_/, "")
				.toUpperCase();
			return !knownCodes.has(
				code as (typeof API_VALIDATION_RULE_CODES)[keyof typeof API_VALIDATION_RULE_CODES],
			);
		});

		expect(unmapped).toEqual([]);
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
