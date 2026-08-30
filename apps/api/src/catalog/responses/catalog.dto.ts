import { Assert, Equals } from "@/common/utils/type-assertions";
import {
	AccessoryOperation,
	Good,
	GoodsType,
	RejectionReason,
	Unit,
} from "../catalog.types";

type _UnitAssertion = Assert<Equals<UnitDto, Unit>>;
type _GoodsTypeAssertion = Assert<Equals<GoodsTypeDto, GoodsType>>;
type _GoodAssertion = Assert<Equals<GoodDto, Good>>;
type _AccessoryOperationAssertion = Assert<
	Equals<AccessoryOperationDto, AccessoryOperation>
>;
type _RejectionReasonAssertion = Assert<
	Equals<RejectionReasonDto, RejectionReason>
>;

export class UnitDto implements Unit {
	id: string;
	name: string;
	isActive: boolean;
	createdAt: string;
}

export class GoodsTypeDto implements GoodsType {
	id: string;
	name: string;
	isActive: boolean;
	createdAt: string;
}

export class GoodDto implements Good {
	id: number;
	name: string;
	createdAt: string;
	isActive: boolean;
	goodsTypeId: string;
	goodsCode: string;
	updatedAt: string;
}

export class AccessoryOperationDto implements AccessoryOperation {
	id: string;
	name: string;
	isActive: boolean;
	createdAt: string;
}

export class RejectionReasonDto implements RejectionReason {
	id: string;
	name: string;
	isActive: boolean;
	createdAt: string;
}
