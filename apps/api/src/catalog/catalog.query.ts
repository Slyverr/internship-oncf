import {
	accessoryOperations,
	goods,
	goodsTypes,
	rejectionReasons,
	units,
} from "drizzle/schema";
import { DrizzleDb } from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import {
	AccessoryOperationInsert,
	GoodInsert,
	GoodsTypeInsert,
	RejectionReasonInsert,
	UnitInsert,
} from "./catalog.types";

export async function findUnits(db: DrizzleDb) {
	return db.query.units.findMany({
		where: {
			isActive: true,
		},
		orderBy: {
			name: "asc",
		},
	});
}

export async function createUnit(db: DrizzleDb, values: UnitInsert) {
	const [created] = await withDbErrorHandling(
		() => db.insert(units).values(values).returning(),
		values,
	);
	return created;
}

export async function findGoodsTypes(db: DrizzleDb) {
	return db.query.goodsTypes.findMany({
		where: {
			isActive: true,
		},
		orderBy: {
			name: "asc",
		},
	});
}

export async function createGoodsType(db: DrizzleDb, values: GoodsTypeInsert) {
	const [created] = await withDbErrorHandling(
		() => db.insert(goodsTypes).values(values).returning(),
		values,
	);
	return created;
}

export async function findGoods(db: DrizzleDb) {
	return db.query.goods.findMany({
		where: {
			isActive: true,
		},
		with: {
			goodsType: {
				columns: {
					name: true,
				},
			},
		},
		orderBy: {
			name: "asc",
		},
	});
}

export async function createGood(db: DrizzleDb, values: GoodInsert) {
	const [created] = await withDbErrorHandling(
		() => db.insert(goods).values(values).returning(),
		values,
	);
	return created;
}

export async function findAccessoryOperations(db: DrizzleDb) {
	return db.query.accessoryOperations.findMany({
		where: {
			isActive: true,
		},
		orderBy: {
			name: "asc",
		},
	});
}

export async function createAccessoryOperation(
	db: DrizzleDb,
	values: AccessoryOperationInsert,
) {
	const [created] = await withDbErrorHandling(
		() => db.insert(accessoryOperations).values(values).returning(),
		values,
	);
	return created;
}

export async function findRejectionReasons(db: DrizzleDb) {
	return db.query.rejectionReasons.findMany({
		where: {
			isActive: true,
		},
		orderBy: {
			name: "asc",
		},
	});
}

export async function createRejectionReason(
	db: DrizzleDb,
	values: RejectionReasonInsert,
) {
	const [created] = await withDbErrorHandling(
		() => db.insert(rejectionReasons).values(values).returning(),
		values,
	);
	return created;
}
