import { Injectable } from "@nestjs/common";
import {
	accessoryOperations,
	goods,
	goodsTypes,
	rejectionReasons,
	units,
} from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { withDbErrorHandling } from "@/database/drizzle.util";
import {
	AccessoryOperationInsert,
	AccessoryOperationUpdate,
	GoodInsert,
	GoodsTypeInsert,
	GoodsTypeUpdate,
	GoodUpdate,
	RejectionReasonInsert,
	RejectionReasonUpdate,
	UnitInsert,
	UnitUpdate,
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

	async findCustomerTypes() {
		return this.drizzle.db.query.customerTypes.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async findManageUnits() {
		return this.drizzle.db.query.units.findMany({
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

	async updateUnit(id: string, values: UnitUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(units)
					.set(values)
					.where(eq(units.id, id))
					.returning(),
			values,
		);
		return updated;
	}

	async findGoodsTypes() {
		return this.drizzle.db.query.goodsTypes.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async findManageGoodsTypes() {
		return this.drizzle.db.query.goodsTypes.findMany({
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

	async updateGoodsType(id: string, values: GoodsTypeUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(goodsTypes)
					.set(values)
					.where(eq(goodsTypes.id, id))
					.returning(),
			values,
		);
		return updated;
	}

	async hasActiveGoodsForType(goodsTypeId: string) {
		return Boolean(
			await this.drizzle.db.query.goods.findFirst({
				where: { goodsTypeId, isActive: true },
				columns: { id: true },
			}),
		);
	}

	async isActiveGoodsType(id: string) {
		return Boolean(
			await this.drizzle.db.query.goodsTypes.findFirst({
				where: { id, isActive: true },
				columns: { id: true },
			}),
		);
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

	async findManageGoods() {
		return this.drizzle.db.query.goods.findMany({
			orderBy: { name: "asc" },
		});
	}

	async updateGood(id: number, values: GoodUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(goods)
					.set(values)
					.where(eq(goods.id, id))
					.returning(),
			values,
		);
		return updated;
	}

	async findAccessoryOperations() {
		return this.drizzle.db.query.accessoryOperations.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async findManageAccessoryOperations() {
		return this.drizzle.db.query.accessoryOperations.findMany({
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

	async updateAccessoryOperation(id: string, values: AccessoryOperationUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(accessoryOperations)
					.set(values)
					.where(eq(accessoryOperations.id, id))
					.returning(),
			values,
		);
		return updated;
	}

	async findRejectionReasons() {
		return this.drizzle.db.query.rejectionReasons.findMany({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	async findManageRejectionReasons() {
		return this.drizzle.db.query.rejectionReasons.findMany({
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

	async updateRejectionReason(id: string, values: RejectionReasonUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(rejectionReasons)
					.set(values)
					.where(eq(rejectionReasons.id, id))
					.returning(),
			values,
		);
		return updated;
	}
}
