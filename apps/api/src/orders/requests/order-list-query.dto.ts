import { IntersectionType, PartialType, PickType } from "@nestjs/swagger";
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
) {}
