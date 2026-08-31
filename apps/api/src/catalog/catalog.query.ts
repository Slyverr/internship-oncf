import { Injectable } from "@nestjs/common";
import {
	accessoryOperations,
	goods,
	goodsTypes,
	rejectionReasons,
	units,
} from "drizzle/schema";
import { DrizzleService } from "@/database/drizzle.service";
import { withDbErrorHandling } from "@/database/drizzle.util";
import {
	AccessoryOperationInsert,
	GoodInsert,
	GoodsTypeInsert,
	RejectionReasonInsert,
	UnitInsert,
} from "./catalog.types";

@Injectable()
export class CatalogQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async findUnits() {
		return this.drizzle.db.query.units.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async createUnit(values: UnitInsert) {
		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(units).values(values).returning(),
			values,
		);
		return created;
	}

	async findGoodsTypes() {
		return this.drizzle.db.query.goodsTypes.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async createGoodsType(values: GoodsTypeInsert) {
		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(goodsTypes).values(values).returning(),
			values,
		);
		return created;
	}

	async findGoods() {
		return this.drizzle.db.query.goods.findMany({
			where: { isActive: true },
			with: {
				goodsType: {
					columns: { name: true },
				},
			},
			orderBy: { name: "asc" },
		});
	}

	async createGood(values: GoodInsert) {
		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(goods).values(values).returning(),
			values,
		);
		return created;
	}

	async findAccessoryOperations() {
		return this.drizzle.db.query.accessoryOperations.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async createAccessoryOperation(values: AccessoryOperationInsert) {
		const [created] = await withDbErrorHandling(
			() =>
				this.drizzle.db.insert(accessoryOperations).values(values).returning(),
			values,
		);
		return created;
	}

	async findRejectionReasons() {
		return this.drizzle.db.query.rejectionReasons.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async createRejectionReason(values: RejectionReasonInsert) {
		const [created] = await withDbErrorHandling(
			() => this.drizzle.db.insert(rejectionReasons).values(values).returning(),
			values,
		);
		return created;
	}
}
