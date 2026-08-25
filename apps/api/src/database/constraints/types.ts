import { HttpStatus } from "@nestjs/common";
import type { ConstraintCode } from "./codes";

// biome-ignore lint:any
export type ErrorContext = Record<string, any>;

export interface ErrorResponse {
	statusCode: HttpStatus;
	code: ConstraintCode;
	message: string;
}

export type ConstraintHandler = (ctx: ErrorContext) => ErrorResponse;
