import {
	accessoryOperations,
	customerTypes,
	goods,
	goodsTypes,
	rejectionReasons,
	units,
} from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { CatalogService } from "./catalog.service";

export type Unit = InferSelectModel<typeof units>;
export type CustomerType = InferSelectModel<typeof customerTypes>;
export type UnitInsert = InferInsertModel<typeof units>;
export type UnitUpdate = Pick<Unit, "name" | "isActive">;

export type GoodsType = InferSelectModel<typeof goodsTypes>;
export type GoodsTypeInsert = InferInsertModel<typeof goodsTypes>;
export type GoodsTypeUpdate = Pick<GoodsType, "name" | "isActive">;

export type Good = InferSelectModel<typeof goods>;
export type GoodInsert = InferInsertModel<typeof goods>;
export type GoodUpdate = Pick<
	Good,
	"name" | "goodsCode" | "goodsTypeId" | "isActive"
>;

export type AccessoryOperation = InferSelectModel<typeof accessoryOperations>;
export type AccessoryOperationInsert = InferInsertModel<
	typeof accessoryOperations
>;
export type AccessoryOperationUpdate = Pick<
	AccessoryOperation,
	"name" | "isActive"
>;

export type RejectionReason = InferSelectModel<typeof rejectionReasons>;
export type RejectionReasonInsert = InferInsertModel<typeof rejectionReasons>;
export type RejectionReasonUpdate = Pick<RejectionReason, "name" | "isActive">;

export type GoodList = Awaited<
	ReturnType<CatalogService["findAllGoods"]>
>[number];
