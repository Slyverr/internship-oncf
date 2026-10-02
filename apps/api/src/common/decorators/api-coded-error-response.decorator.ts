import { HttpStatus } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { ApiErrorResponseDto } from "../responses/api-error-response.dto";

export function ApiCodedErrorResponse(status: HttpStatus) {
	return ApiResponse({ status, type: ApiErrorResponseDto });
}
