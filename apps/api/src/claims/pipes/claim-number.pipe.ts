import { API_ERROR_CODES } from "@ecommand/shared";
import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import type { ClaimNumber } from "../claims.types";

@Injectable()
export class ClaimNumberPipe implements PipeTransform<string, ClaimNumber> {
	transform(value: string): ClaimNumber {
		if (!/^CLM-[A-Z0-9]{10}$/.test(value)) {
			throw new BadRequestException({
				code: API_ERROR_CODES.INVALID_IDENTIFIER,
			});
		}
		return value as ClaimNumber;
	}
}
