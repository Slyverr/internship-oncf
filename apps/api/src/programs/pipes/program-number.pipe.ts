import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import type { ProgramNumber } from "../programs.types";

@Injectable()
export class ProgramNumberPipe implements PipeTransform<string, ProgramNumber> {
	transform(value: string): ProgramNumber {
		if (!/^PRG-[A-Z0-9]{10}$/.test(value)) {
			throw new BadRequestException("Invalid program number");
		}
		return value as ProgramNumber;
	}
}
