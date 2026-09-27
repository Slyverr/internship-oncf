import { BadRequestException } from "@nestjs/common";

export function parsePositiveInteger(value: string, label: string): number {
	const id = Number(value);
	if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) {
		throw new BadRequestException(`Invalid ${label} ID`);
	}
	return id;
}
