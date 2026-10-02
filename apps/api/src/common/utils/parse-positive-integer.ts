import { API_ERROR_CODES } from "@ecommand/shared";
import { BadRequestException } from "@nestjs/common";

export function parsePositiveInteger(value: string): number {
	const id = Number(value);
	if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) {
		throw new BadRequestException({ code: API_ERROR_CODES.INVALID_IDENTIFIER });
	}
	return id;
}
