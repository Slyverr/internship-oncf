import { API_ERROR_CODES } from "@ecommand/shared";
import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import type { OrderNumber } from "../orders.types";

@Injectable()
export class OrderNumberPipe implements PipeTransform<string, OrderNumber> {
	transform(value: string): OrderNumber {
		if (!/^ORD-[A-Z0-9]{10}$/.test(value)) {
			throw new BadRequestException({
				code: API_ERROR_CODES.INVALID_IDENTIFIER,
			});
		}
		return value as OrderNumber;
	}
}
