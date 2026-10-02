import { Injectable, PipeTransform } from "@nestjs/common";
import { parsePositiveInteger } from "@/common/utils/parse-positive-integer";

@Injectable()
export class FileIdPipe implements PipeTransform<string> {
	transform(value: string) {
		return parsePositiveInteger(value);
	}
}
