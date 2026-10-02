import { CatalogMapper } from "./catalog.mapper";

describe("CatalogMapper", () => {
	const mapper = new CatalogMapper();

	it("creates unique UUIDs for user-managed units", () => {
		const dto = { name: "TON" };
		const first = mapper.toCreateUnit(dto);
		const second = mapper.toCreateUnit(dto);
		expect(first).toMatchObject({ name: dto.name });
		expect(first.id).toMatch(/^[0-9a-f-]{36}$/i);
		expect(first.id).not.toBe(second.id);
	});

	it("creates unique UUIDs for user-managed goods types", () => {
		const dto = { name: "Bulk" };
		const first = mapper.toCreateGoodsType(dto);
		const second = mapper.toCreateGoodsType(dto);
		expect(first).toMatchObject({ name: dto.name });
		expect(first.id).toMatch(/^[0-9a-f-]{36}$/i);
		expect(first.id).not.toBe(second.id);
	});

	it("preserves a good's code and goods-type relationship", () => {
		const dto = { name: "Iron ore", goodsCode: "FE", goodsTypeId: "type-id" };
		expect(mapper.toCreateGood(dto)).toEqual(dto);
	});

	it("creates unique UUIDs for user-managed accessory operations", () => {
		const dto = { name: "Weighing" };
		const first = mapper.toCreateAccessoryOperation(dto);
		const second = mapper.toCreateAccessoryOperation(dto);
		expect(first).toMatchObject({ name: dto.name });
		expect(first.id).toMatch(/^[0-9a-f-]{36}$/i);
		expect(first.id).not.toBe(second.id);
	});

	it("creates unique UUIDs for user-managed rejection reasons", () => {
		const dto = { name: "Damaged" };
		const first = mapper.toCreateRejectionReason(dto);
		const second = mapper.toCreateRejectionReason(dto);
		expect(first).toMatchObject({ name: dto.name });
		expect(first.id).toMatch(/^[0-9a-f-]{36}$/i);
		expect(first.id).not.toBe(second.id);
	});
});
