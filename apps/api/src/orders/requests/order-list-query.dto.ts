import {
	ApiPropertyOptional,
	IntersectionType,
	PartialType,
	PickType,
} from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import { CreateOrderDto } from "./create-order.dto";

class OrderFilterFieldsDto extends PartialType(
	PickType(CreateOrderDto, [
		"goodsId",
		"customerId",
		"status",
		"movementTypeId",
		"startDate",
		"endDate",
	] as const),
) {}

export class OrderListQueryDto extends IntersectionType(
	ListQueryDto,
	OrderFilterFieldsDto,
) {
	@ApiPropertyOptional({ type: Boolean })
	@Transform(({ value }) => {
		if (value === "true") return true;
		if (value === "false") return false;
		return value;
	})
	@IsOptional()
	@IsBoolean()
	hasAssignedWagons?: boolean;
}
