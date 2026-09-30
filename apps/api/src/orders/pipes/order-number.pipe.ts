import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import type { OrderNumber } from "../orders.types";

@Injectable()
export class OrderNumberPipe implements PipeTransform<string, OrderNumber> {
	transform(value: string): OrderNumber {
		if (!/^ORD-[A-Z0-9]{10}$/.test(value)) {
			throw new BadRequestException("Invalid order number");
		}
		return value as OrderNumber;
	}
}
