import { IntersectionType, PartialType, PickType } from "@nestjs/swagger";
import { ListQueryDto } from "@/common/requests/list-query.dto";
import { CreateCustomerDto } from "./create-customer.dto";

class CustomerFilterFieldsDto extends PartialType(
	PickType(CreateCustomerDto, ["typeId", "isActive"] as const),
) {}

export class ListCustomerQueryDto extends IntersectionType(
	ListQueryDto,
	CustomerFilterFieldsDto,
) {}
