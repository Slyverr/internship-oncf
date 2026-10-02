import { API_ERROR_CODES } from "@ecommand/shared";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { CatalogMapper } from "./catalog.mapper";
import { CatalogQuery } from "./catalog.query";
import { CatalogService } from "./catalog.service";

const operationCases = [
	{
		findMethod: "findAllUnits",
		queryFindMethod: "findUnits",
		createMethod: "createUnit",
		mapperMethod: "toCreateUnit",
		queryCreateMethod: "createUnit",
		dto: { name: "TON" },
		values: { id: "unit-id", name: "TON" },
	},
	{
		findMethod: "findAllGoodsTypes",
		queryFindMethod: "findGoodsTypes",
		createMethod: "createGoodsType",
		mapperMethod: "toCreateGoodsType",
		queryCreateMethod: "createGoodsType",
		dto: { name: "Bulk" },
		values: { id: "type-id", name: "Bulk" },
	},
	{
		findMethod: "findAllGoods",
		queryFindMethod: "findGoods",
		createMethod: "createGood",
		mapperMethod: "toCreateGood",
		queryCreateMethod: "createGood",
		dto: { name: "Iron", goodsCode: "FE", goodsTypeId: "type-id" },
		values: { name: "Iron", goodsCode: "FE", goodsTypeId: "type-id" },
	},
	{
		findMethod: "findAllAccessoryOperations",
		queryFindMethod: "findAccessoryOperations",
		createMethod: "createAccessoryOperation",
		mapperMethod: "toCreateAccessoryOperation",
		queryCreateMethod: "createAccessoryOperation",
		dto: { name: "Weighing" },
		values: { id: "operation-id", name: "Weighing" },
	},
	{
		findMethod: "findAllRejectionReasons",
		queryFindMethod: "findRejectionReasons",
		createMethod: "createRejectionReason",
		mapperMethod: "toCreateRejectionReason",
		queryCreateMethod: "createRejectionReason",
		dto: { name: "Damaged" },
		values: { id: "reason-id", name: "Damaged" },
	},
] as const;

describe("CatalogService", () => {
	const query = Object.fromEntries(
		[
			"findUnits",
			"createUnit",
			"findGoodsTypes",
			"createGoodsType",
			"findGoods",
			"createGood",
			"isActiveGoodsType",
			"findAccessoryOperations",
			"createAccessoryOperation",
			"findRejectionReasons",
			"createRejectionReason",
		].map((method) => [method, jest.fn()]),
	) as Record<string, jest.Mock>;
	const mapper = Object.fromEntries(
		[
			"toCreateUnit",
			"toCreateGoodsType",
			"toCreateGood",
			"toCreateAccessoryOperation",
			"toCreateRejectionReason",
		].map((method) => [method, jest.fn()]),
	) as Record<string, jest.Mock>;
	const service = new CatalogService(
		query as unknown as CatalogQuery,
		mapper as unknown as CatalogMapper,
	);
	const methods = service as unknown as Record<
		string,
		(...args: unknown[]) => Promise<unknown>
	>;

	beforeEach(() => {
		for (const mock of [...Object.values(query), ...Object.values(mapper)]) {
			mock.mockReset();
		}
		query.isActiveGoodsType.mockResolvedValue(true);
	});

	it.each(operationCases)(
		"delegates $findMethod to its read query",
		async ({ findMethod, queryFindMethod }) => {
			const rows = [{ id: "record-id" }];
			query[queryFindMethod].mockResolvedValue(rows);
			expect(await methods[findMethod]()).toBe(rows);
			expect(query[queryFindMethod]).toHaveBeenCalledTimes(1);
		},
	);

	it.each(operationCases)(
		"maps and creates with $createMethod",
		async ({ createMethod, mapperMethod, queryCreateMethod, dto, values }) => {
			const created = { id: "record-id" };
			mapper[mapperMethod].mockReturnValue(values);
			query[queryCreateMethod].mockResolvedValue(created);
			expect(await methods[createMethod](dto)).toBe(created);
			expect(mapper[mapperMethod]).toHaveBeenCalledWith(dto);
			expect(query[queryCreateMethod]).toHaveBeenCalledWith(values);
		},
	);
});

describe("CatalogService management", () => {
	const query = {
		createGood: jest.fn(),
		hasActiveGoodsForType: jest.fn(),
		isActiveGoodsType: jest.fn(),
		updateGood: jest.fn(),
		updateGoodsType: jest.fn(),
		updateUnit: jest.fn(),
	} as unknown as jest.Mocked<CatalogQuery>;
	const service = new CatalogService(query, new CatalogMapper());

	beforeEach(() => jest.clearAllMocks());

	it("blocks archiving a goods type that still has active goods", async () => {
		jest.mocked(query.hasActiveGoodsForType).mockResolvedValue(true);

		await expect(
			service.updateGoodsType("type-id", { name: "Freight", isActive: false }),
		).rejects.toBeInstanceOf(ConflictException);
		expect(query.updateGoodsType).not.toHaveBeenCalled();
	});

	it("allows archiving a goods type with no active goods", async () => {
		const updated = { id: "type-id", name: "Freight", isActive: false };
		jest.mocked(query.hasActiveGoodsForType).mockResolvedValue(false);
		jest.mocked(query.updateGoodsType).mockResolvedValue(updated as never);

		await expect(
			service.updateGoodsType("type-id", { name: "Freight", isActive: false }),
		).resolves.toBe(updated);
	});

	it("rejects creating goods under an inactive goods type", async () => {
		jest.mocked(query.isActiveGoodsType).mockResolvedValue(false);

		const error = await service
			.createGood({ name: "Rails", goodsCode: "RAIL", goodsTypeId: "type-id" })
			.catch((cause: unknown) => cause);
		expect(error).toBeInstanceOf(ConflictException);
		expect((error as ConflictException).getResponse()).toEqual({
			code: API_ERROR_CODES.CATALOG_GOODS_TYPE_INACTIVE,
		});
		expect(query.createGood).not.toHaveBeenCalled();
	});

	it("rejects reactivating goods while its goods type is inactive", async () => {
		jest.mocked(query.isActiveGoodsType).mockResolvedValue(false);

		await expect(
			service.updateGood(1, {
				name: "Rails",
				goodsCode: "RAIL",
				goodsTypeId: "type-id",
				isActive: true,
			}),
		).rejects.toBeInstanceOf(ConflictException);
		expect(query.updateGood).not.toHaveBeenCalled();
	});

	it("returns not found when an update targets a missing unit", async () => {
		jest.mocked(query.updateUnit).mockResolvedValue(undefined as never);

		await expect(
			service.updateUnit("missing-id", { name: "Tonnes", isActive: true }),
		).rejects.toBeInstanceOf(NotFoundException);
	});
});
