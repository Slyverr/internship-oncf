import {
	accessoryOperations,
	goods,
	goodsTypes,
	rejectionReasons,
	units,
} from "drizzle/schema";
import type { DrizzleService } from "@/database/drizzle.service";
import { CatalogQuery } from "./catalog.query";

describe("CatalogQuery reference-data visibility", () => {
	const insert = jest.fn();
	const insertValues = jest.fn();
	const insertReturning = jest.fn();
	const update = jest.fn();
	const updateSet = jest.fn();
	const updateWhere = jest.fn();
	const updateReturning = jest.fn();
	const findMany = jest.fn();
	const unitsFindMany = jest.fn();
	const customerTypesFindMany = jest.fn();
	const goodsTypesFindMany = jest.fn();
	const accessoryOperationsFindMany = jest.fn();
	const rejectionReasonsFindMany = jest.fn();
	const findFirst = jest.fn();
	const query = new CatalogQuery({
		db: {
			insert,
			update,
			query: {
				goods: { findMany, findFirst },
				goodsTypes: { findMany: goodsTypesFindMany, findFirst },
				units: { findMany: unitsFindMany },
				customerTypes: { findMany: customerTypesFindMany },
				accessoryOperations: { findMany: accessoryOperationsFindMany },
				rejectionReasons: { findMany: rejectionReasonsFindMany },
			},
		},
	} as unknown as DrizzleService);

	beforeEach(() => {
		for (const find of [
			findMany,
			unitsFindMany,
			customerTypesFindMany,
			goodsTypesFindMany,
			accessoryOperationsFindMany,
			rejectionReasonsFindMany,
		]) {
			find.mockReset().mockResolvedValue([]);
		}
		findFirst.mockReset().mockResolvedValue(undefined);
		insert.mockReset().mockReturnValue({ values: insertValues });
		insertValues.mockReset().mockReturnValue({ returning: insertReturning });
		insertReturning.mockReset().mockResolvedValue([{ id: "created" }]);
		update.mockReset().mockReturnValue({ set: updateSet });
		updateSet.mockReset().mockReturnValue({ where: updateWhere });
		updateWhere.mockReset().mockReturnValue({ returning: updateReturning });
		updateReturning.mockReset().mockResolvedValue([{ id: "updated" }]);
	});

	it.each([
		[
			"unit",
			() => query.createUnit({ name: "ton" } as never),
			units,
			{ name: "ton" },
		],
		[
			"goods type",
			() => query.createGoodsType({ name: "bulk" } as never),
			goodsTypes,
			{ name: "bulk" },
		],
		[
			"good",
			() => query.createGood({ name: "wheat" } as never),
			goods,
			{ name: "wheat" },
		],
		[
			"accessory operation",
			() => query.createAccessoryOperation({ name: "handling" } as never),
			accessoryOperations,
			{ name: "handling" },
		],
		[
			"rejection reason",
			() => query.createRejectionReason({ name: "invalid" } as never),
			rejectionReasons,
			{ name: "invalid" },
		],
	] as const)(
		"persists %s through its Drizzle table",
		async (_name, create, table, values) => {
			const created = { id: "created" };
			insertReturning.mockResolvedValueOnce([created]);

			await expect(create()).resolves.toBe(created);
			expect(insert).toHaveBeenCalledWith(table);
			expect(insertValues).toHaveBeenCalledWith(values);
			expect(insertReturning).toHaveBeenCalledTimes(1);
		},
	);

	it.each([
		[
			"unit",
			() => query.updateUnit("unit-1", { name: "kilogram" } as never),
			units,
			{ name: "kilogram" },
		],
		[
			"goods type",
			() => query.updateGoodsType("type-1", { name: "grain" } as never),
			goodsTypes,
			{ name: "grain" },
		],
		[
			"good",
			() => query.updateGood(7, { name: "barley" } as never),
			goods,
			{ name: "barley" },
		],
		[
			"accessory operation",
			() =>
				query.updateAccessoryOperation("operation-1", {
					name: "storage",
				} as never),
			accessoryOperations,
			{ name: "storage" },
		],
		[
			"rejection reason",
			() =>
				query.updateRejectionReason("reason-1", {
					name: "incomplete",
				} as never),
			rejectionReasons,
			{ name: "incomplete" },
		],
	] as const)(
		"updates %s through its Drizzle table",
		async (_name, save, table, values) => {
			const updated = { id: "updated" };
			updateReturning.mockResolvedValueOnce([updated]);

			await expect(save()).resolves.toBe(updated);
			expect(update).toHaveBeenCalledWith(table);
			expect(updateSet).toHaveBeenCalledWith(values);
			expect(updateWhere).toHaveBeenCalledTimes(1);
			expect(updateReturning).toHaveBeenCalledTimes(1);
		},
	);

	it("lists only active goods with their type name for user selectors", async () => {
		await query.findGoods();

		expect(findMany).toHaveBeenCalledWith({
			where: { isActive: true },
			with: { goodsType: { columns: { name: true } } },
			orderBy: { name: "asc" },
		});
	});

	it("includes archived goods in the management list", async () => {
		await query.findManageGoods();

		expect(findMany).toHaveBeenCalledWith({ orderBy: { name: "asc" } });
	});

	it("filters active lists and leaves archived rows available to admins", async () => {
		await query.findUnits();
		expect(unitsFindMany).toHaveBeenLastCalledWith({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});

		await query.findManageUnits();
		expect(unitsFindMany).toHaveBeenLastCalledWith({
			orderBy: { name: "asc" },
		});

		await query.findCustomerTypes();
		expect(customerTypesFindMany).toHaveBeenLastCalledWith({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});

		await query.findGoodsTypes();
		expect(goodsTypesFindMany).toHaveBeenLastCalledWith({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
		await query.findManageGoodsTypes();
		expect(goodsTypesFindMany).toHaveBeenLastCalledWith({
			orderBy: { name: "asc" },
		});

		await query.findAccessoryOperations();
		expect(accessoryOperationsFindMany).toHaveBeenLastCalledWith({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
		await query.findManageAccessoryOperations();
		expect(accessoryOperationsFindMany).toHaveBeenLastCalledWith({
			orderBy: { name: "asc" },
		});

		await query.findRejectionReasons();
		expect(rejectionReasonsFindMany).toHaveBeenLastCalledWith({
			where: { isActive: true },
			orderBy: { name: "asc" },
		});
		await query.findManageRejectionReasons();
		expect(rejectionReasonsFindMany).toHaveBeenLastCalledWith({
			orderBy: { name: "asc" },
		});
	});

	it("detects active goods before archiving their type", async () => {
		findFirst.mockResolvedValueOnce({ id: "record-1" });

		const result = await query.hasActiveGoodsForType("TYPE-1");

		expect(result).toBe(true);
		expect(findFirst).toHaveBeenCalledWith({
			where: { goodsTypeId: "TYPE-1", isActive: true },
			columns: { id: true },
		});
	});

	it("returns false when a type has no active goods", async () => {
		findFirst.mockResolvedValueOnce(undefined);

		await expect(query.hasActiveGoodsForType("TYPE-1")).resolves.toBe(false);
	});

	it("detects active goods types for good assignment", async () => {
		findFirst.mockResolvedValueOnce({ id: "type-1" });

		await expect(query.isActiveGoodsType("TYPE-1")).resolves.toBe(true);
		expect(findFirst).toHaveBeenCalledWith({
			where: { id: "TYPE-1", isActive: true },
			columns: { id: true },
		});
	});

	it("rejects inactive goods types for good assignment", async () => {
		findFirst.mockResolvedValueOnce(undefined);

		await expect(query.isActiveGoodsType("TYPE-1")).resolves.toBe(false);
	});
});
