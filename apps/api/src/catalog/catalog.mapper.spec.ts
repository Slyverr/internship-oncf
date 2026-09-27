import {
	ACCESSORY_OPERATIONS_SCOPE,
	GOODS_TYPES_SCOPE,
	REJECTION_REASONS_SCOPE,
	UNITS_SCOPE,
} from "@/database/reference-data";
import { createReferenceId } from "@/database/reference-data/reference-data.utils";
import { CatalogMapper } from "./catalog.mapper";

describe("CatalogMapper", () => {
	const mapper = new CatalogMapper();

	it("creates stable unit ids from normalized reference values", () => {
		const dto = { name: "TON" };
		expect(mapper.toCreateUnit(dto)).toEqual({
			id: createReferenceId(UNITS_SCOPE, dto.name),
			name: dto.name,
		});
		expect(mapper.toCreateUnit(dto).id).toBe(mapper.toCreateUnit(dto).id);
	});

	it("creates stable goods-type ids", () => {
		const dto = { name: "Bulk" };
		expect(mapper.toCreateGoodsType(dto)).toEqual({
			id: createReferenceId(GOODS_TYPES_SCOPE, dto.name),
			name: dto.name,
		});
	});

	it("preserves a good's code and goods-type relationship", () => {
		const dto = { name: "Iron ore", goodsCode: "FE", goodsTypeId: "type-id" };
		expect(mapper.toCreateGood(dto)).toEqual(dto);
	});

	it("creates stable accessory-operation ids", () => {
		const dto = { name: "Weighing" };
		expect(mapper.toCreateAccessoryOperation(dto)).toEqual({
			id: createReferenceId(ACCESSORY_OPERATIONS_SCOPE, dto.name),
			name: dto.name,
		});
	});

	it("creates stable rejection-reason ids", () => {
		const dto = { name: "Damaged" };
		expect(mapper.toCreateRejectionReason(dto)).toEqual({
			id: createReferenceId(REJECTION_REASONS_SCOPE, dto.name),
			name: dto.name,
		});
	});
});
