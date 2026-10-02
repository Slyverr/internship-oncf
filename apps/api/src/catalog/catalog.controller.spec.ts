import { Permission } from "@ecommand/shared";
import { PERMISSIONS_ANY_KEY } from "@/auth/permissions.decorator";
import { CatalogController } from "./catalog.controller";

const endpoints = [
	{
		action: "findCustomerTypes",
		permission: Permission.CATALOG_READ,
		method: "findAllCustomerTypes",
		args: [],
	},
	{
		action: "findUnits",
		permission: Permission.CATALOG_READ,
		method: "findAllUnits",
		args: [],
	},
	{
		action: "createUnit",
		permission: Permission.CATALOG_MANAGE_UNITS,
		method: "createUnit",
		args: [{ name: "TON" }],
	},
	{
		action: "findManageUnits",
		permission: Permission.CATALOG_MANAGE_UNITS,
		method: "findManageUnits",
		args: [],
	},
	{
		action: "updateUnit",
		permission: Permission.CATALOG_MANAGE_UNITS,
		method: "updateUnit",
		args: ["unit-id", { name: "TON", isActive: true }],
	},
	{
		action: "findGoodsTypes",
		permission: Permission.CATALOG_READ,
		method: "findAllGoodsTypes",
		args: [],
	},
	{
		action: "createGoodsType",
		permission: Permission.CATALOG_MANAGE_GOODS_TYPES,
		method: "createGoodsType",
		args: [{ name: "Bulk" }],
	},
	{
		action: "findManageGoodsTypes",
		permission: Permission.CATALOG_MANAGE_GOODS_TYPES,
		method: "findManageGoodsTypes",
		args: [],
	},
	{
		action: "updateGoodsType",
		permission: Permission.CATALOG_MANAGE_GOODS_TYPES,
		method: "updateGoodsType",
		args: ["type-id", { name: "Bulk", isActive: true }],
	},
	{
		action: "findGoods",
		permission: Permission.CATALOG_READ,
		method: "findAllGoods",
		args: [],
	},
	{
		action: "createGood",
		permission: Permission.CATALOG_MANAGE_GOODS,
		method: "createGood",
		args: [{ name: "Iron", goodsCode: "FE", goodsTypeId: "type-id" }],
	},
	{
		action: "findManageGoods",
		permission: Permission.CATALOG_MANAGE_GOODS,
		method: "findManageGoods",
		args: [],
	},
	{
		action: "updateGood",
		permission: Permission.CATALOG_MANAGE_GOODS,
		method: "updateGood",
		args: [
			1,
			{ name: "Iron", goodsCode: "FE", goodsTypeId: "type-id", isActive: true },
		],
	},
	{
		action: "findAccessoryOperations",
		permission: Permission.CATALOG_READ,
		method: "findAllAccessoryOperations",
		args: [],
	},
	{
		action: "createAccessoryOperation",
		permission: Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS,
		method: "createAccessoryOperation",
		args: [{ name: "Weighing" }],
	},
	{
		action: "findManageAccessoryOperations",
		permission: Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS,
		method: "findManageAccessoryOperations",
		args: [],
	},
	{
		action: "updateAccessoryOperation",
		permission: Permission.CATALOG_MANAGE_ACCESSORY_OPERATIONS,
		method: "updateAccessoryOperation",
		args: ["operation-id", { name: "Weighing", isActive: true }],
	},
	{
		action: "findRejectionReasons",
		permission: Permission.CATALOG_READ,
		method: "findAllRejectionReasons",
		args: [],
	},
	{
		action: "createRejectionReason",
		permission: Permission.CATALOG_MANAGE_REJECTION_REASONS,
		method: "createRejectionReason",
		args: [{ name: "Damaged" }],
	},
	{
		action: "findManageRejectionReasons",
		permission: Permission.CATALOG_MANAGE_REJECTION_REASONS,
		method: "findManageRejectionReasons",
		args: [],
	},
	{
		action: "updateRejectionReason",
		permission: Permission.CATALOG_MANAGE_REJECTION_REASONS,
		method: "updateRejectionReason",
		args: ["reason-id", { name: "Damaged", isActive: true }],
	},
] as const;

describe("CatalogController authorization mapping", () => {
	const service = Object.fromEntries(
		[...new Set(endpoints.map(({ method }) => method))].map((method) => [
			method,
			jest.fn().mockResolvedValue({ method }),
		]),
	);
	const controller = new CatalogController(service as never);
	const controllerMethods = controller as unknown as Record<
		string,
		(...args: unknown[]) => unknown
	>;

	beforeEach(() => {
		for (const fn of Object.values(service)) fn.mockClear();
	});

	it.each(endpoints)(
		"requires $permission for $action and forwards its input",
		async ({ action, permission, method, args }) => {
			expect(
				Reflect.getMetadata(
					PERMISSIONS_ANY_KEY,
					CatalogController.prototype[action],
				),
			).toEqual([permission]);
			expect(await controllerMethods[action](...args)).toEqual({ method });
			expect(service[method]).toHaveBeenCalledWith(...args);
		},
	);

	it("uses distinct read and management permissions for every catalog resource", () => {
		for (const { action, permission } of endpoints) {
			const grants = Reflect.getMetadata(
				PERMISSIONS_ANY_KEY,
				CatalogController.prototype[action],
			) as Permission[];
			expect(grants).toEqual([permission]);
		}
		expect(
			endpoints.filter(
				({ permission }) => permission === Permission.CATALOG_READ,
			),
		).toHaveLength(6);
	});
});
