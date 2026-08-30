import {
	AccessoryOperation,
	CustomerType,
	GoodsType,
	Unit,
} from "@ecommand/shared";
import {
	createReferenceId,
	createReferenceMap,
	enumReferenceMapper,
} from "../reference-data.utils";

export const ACCESSORY_OPERATIONS_SCOPE = "accessory_operations";
export const CUSTOMER_TYPES_SCOPE = "customer_types";
export const GOODS_TYPES_SCOPE = "goods_types";
export const ATTRIBUTES_SCOPE = "attributes";
export const UNITS_SCOPE = "units";

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

export const ATTRIBUTE_NAMES = [
	"Cereal type",
	"Weight",
	"Container type",
	"Origin port",
	"Destination port",
	"Booking number",
	"Shipping company",
	"Vessel",
	"Importer",
	"Cargo",
	"Berthing date",
	"TC 20 ft",
	"TC 20 count",
	"TC 40 ft",
	"TC 40 count",
	"Vessel name",
	"Expeditor customer code",
] as const;

export type AttributeName = (typeof ATTRIBUTE_NAMES)[number];

export const ATTRIBUTES = ATTRIBUTE_NAMES.map((name) => ({
	id: createReferenceId(ATTRIBUTES_SCOPE, name),
	name,
	dataType: name.includes("date")
		? "date"
		: name.includes("count")
			? "number"
			: name.includes("ft")
				? "boolean"
				: name === "Weight"
					? "decimal"
					: "string",
})) satisfies {
	id: string;
	name: AttributeName;
	dataType: "date" | "number" | "boolean" | "decimal" | "string";
}[];

const requiredAttributes = (...attributes: AttributeName[]) =>
	attributes.map((attributeName) => ({
		attributeName,
		isRequired: true,
	}));

export const PARAMETRIZATION = {
	[GoodsType.CEREALS]: requiredAttributes(
		"Cereal type",
		"Cargo",
		"Berthing date",
		"Importer",
		"Vessel",
		"Vessel name",
		"Expeditor customer code",
	),

	[GoodsType.CONTAINERS_TC]: requiredAttributes(
		"Container type",
		"Origin port",
		"Destination port",
	),

	[GoodsType.PHOSPHATE]: [],
	[GoodsType.HYDROCARBONS]: [],
	[GoodsType.ORES]: [],
	[GoodsType.CHEMICALS]: [],
	[GoodsType.BUILDING_MATERIALS]: [],
	[GoodsType.AGRICULTURAL_PRODUCTS]: [],
	[GoodsType.OTHER]: [],
} satisfies Record<
	GoodsType,
	{ attributeName: AttributeName; isRequired: boolean }[]
>;

export const LEGACY_UNITS = [
	"Tonne",
	"Kilogramme",
	"Wagon",
	"Conteneur",
	"Palette",
	"Mètre cube",
	"Litre",
] as const;
