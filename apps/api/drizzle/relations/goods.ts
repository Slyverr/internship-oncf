import { defineRelationsPart } from "drizzle-orm";
import * as schema from "../schema";

const goodsPart = defineRelationsPart(schema, (r) => ({
	goods: {
		goodsType: r.one.goodsTypes({
			from: r.goods.goodsTypeId,
			to: r.goodsTypes.id,
		}),
		orders: r.many.orders({
			from: r.goods.id,
			to: r.orders.goodsId,
		}),
	},
}));

const goodsTypesPart = defineRelationsPart(schema, (r) => ({
	goodsTypes: {
		goods: r.many.goods({
			from: r.goodsTypes.id,
			to: r.goods.goodsTypeId,
		}),
		parametrizations: r.many.parametrization({
			from: r.goodsTypes.id,
			to: r.parametrization.goodsTypeId,
		}),
	},
}));

const parametrizationPart = defineRelationsPart(schema, (r) => ({
	parametrization: {
		goodsType: r.one.goodsTypes({
			from: r.parametrization.goodsTypeId,
			to: r.goodsTypes.id,
		}),
		attribute: r.one.attributes({
			from: r.parametrization.attributeId,
			to: r.attributes.id,
		}),
	},
}));

const attributesPart = defineRelationsPart(schema, (r) => ({
	attributes: {
		parametrizations: r.many.parametrization({
			from: r.attributes.id,
			to: r.parametrization.attributeId,
		}),
		orderAttributes: r.many.orderAttributes({
			from: r.attributes.id,
			to: r.orderAttributes.attributeId,
		}),
	},
}));

const unitsPart = defineRelationsPart(schema, (r) => ({
	units: {
		orders: r.many.orders({
			from: r.units.id,
			to: r.orders.unitId,
		}),
	},
}));

export const goodsRelations = {
	...goodsPart,
	...goodsTypesPart,
	...parametrizationPart,
	...attributesPart,
	...unitsPart,
};
