import { IntersectionType, PartialType, PickType } from "@nestjs/swagger";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import { CreateClaimDto } from "./create-claim.dto";

class ClaimFilterFieldsDto extends PartialType(
	PickType(CreateClaimDto, [
		"customerId",
		"userId",
		"orderId",
		"operationId",
		"type",
		"status",
		"priority",
	] as const),
) {}

export class ListClaimQueryDto extends IntersectionType(
	ListQueryDto,
	ClaimFilterFieldsDto,
) {}
