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
