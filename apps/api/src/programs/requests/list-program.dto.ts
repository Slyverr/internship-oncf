import { IntersectionType, PartialType, PickType } from "@nestjs/swagger";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import { CreateProgramDto } from "./create-program.dto";

class ProgramFilterFieldsDto extends PartialType(
	PickType(CreateProgramDto, [
		"orderId",
		"userId",
		"status",
		"dtmStatus",
	] as const),
) {}

export class ListProgramQueryDto extends IntersectionType(
	ListQueryDto,
	ProgramFilterFieldsDto,
) {}
