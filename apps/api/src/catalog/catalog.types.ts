import {
	accessoryOperations,
	goods,
	goodsTypes,
	rejectionReasons,
	units,
} from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { CatalogService } from "./catalog.service";

export type Unit = InferSelectModel<typeof units>;
export type UnitInsert = InferInsertModel<typeof units>;

export type GoodsType = InferSelectModel<typeof goodsTypes>;
export type GoodsTypeInsert = InferInsertModel<typeof goodsTypes>;

export type Good = InferSelectModel<typeof goods>;
export type GoodInsert = InferInsertModel<typeof goods>;

export type AccessoryOperation = InferSelectModel<typeof accessoryOperations>;
export type AccessoryOperationInsert = InferInsertModel<
	typeof accessoryOperations
>;

export type RejectionReason = InferSelectModel<typeof rejectionReasons>;
export type RejectionReasonInsert = InferInsertModel<typeof rejectionReasons>;

export type GoodList = Awaited<
	ReturnType<CatalogService["findAllGoods"]>
>[number];
