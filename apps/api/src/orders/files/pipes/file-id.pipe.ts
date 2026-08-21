import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class FileIdPipe implements PipeTransform<string> {
	transform(value: string) {
		const id = parseInt(value, 10);

		if (Number.isNaN(id) || id <= 0) {
			throw new BadRequestException("Invalid file ID");
		}

		return id;
	}
}
