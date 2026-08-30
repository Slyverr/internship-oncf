import {
	AccessoryOperation,
	ATTRIBUTE_DEFINITIONS,
	Attribute,
	CustomerType,
	DEFAULT_PARAMETRIZATION,
	GoodsType,
	LEGACY_UNITS,
	Unit,
} from "@ecommand/shared";
import {
	createReferenceId,
	createReferenceMap,
	defaultReferenceMapper,
	enumReferenceMapper,
} from "../reference-data.utils";

export const ACCESSORY_OPERATIONS_SCOPE = "accessory_operations";
export const CUSTOMER_TYPES_SCOPE = "customer_types";
export const GOODS_TYPES_SCOPE = "goods_types";
export const ATTRIBUTES_SCOPE = "attributes";
export const UNITS_SCOPE = "units";

export { LEGACY_UNITS };

export const CUSTOMER_TYPES = createReferenceMap(
	CustomerType,
	enumReferenceMapper(CUSTOMER_TYPES_SCOPE),
);

export const ACCESSORY_OPERATIONS = createReferenceMap(
	AccessoryOperation,
	enumReferenceMapper(ACCESSORY_OPERATIONS_SCOPE),
);

export const GOODS_TYPES = createReferenceMap(
	GoodsType,
	enumReferenceMapper(GOODS_TYPES_SCOPE),
);

export const UNITS = createReferenceMap(Unit, enumReferenceMapper(UNITS_SCOPE));

export const ATTRIBUTES = createReferenceMap(
	ATTRIBUTE_DEFINITIONS,
	(name, dataType) => ({
		...defaultReferenceMapper(ATTRIBUTES_SCOPE)(name, undefined),
		dataType,
	}),
);

const GOODS_TYPE_KEY_BY_VALUE = Object.fromEntries(
	Object.entries(GoodsType).map(([key, value]) => [value, key]),
) as Record<GoodsType, string>;

export const PARAMETRIZATION_MAP = createReferenceMap(
	DEFAULT_PARAMETRIZATION,
	(goodsTypeValue, attributeKeys) => {
		const goodsTypeKey = GOODS_TYPE_KEY_BY_VALUE[goodsTypeValue as GoodsType];

		return attributeKeys.map((attrKey: Attribute) => ({
			goodsTypeId: createReferenceId(GOODS_TYPES_SCOPE, goodsTypeKey),
			attributeId: createReferenceId(ATTRIBUTES_SCOPE, attrKey),
			isRequired: true,
		}));
	},
);

export const PARAMETRIZATION = Object.values(PARAMETRIZATION_MAP).flat();
