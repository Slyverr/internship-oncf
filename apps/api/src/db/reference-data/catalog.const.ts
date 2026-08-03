import { GoodsType } from "./catalog.enum";

export const ATTRIBUTES: { name: string; dataType: string }[] = [
	{ name: "Cereal type", dataType: "string" },
	{ name: "Weight", dataType: "decimal" },
	{ name: "Container type", dataType: "string" },
	{ name: "Origin port", dataType: "string" },
	{ name: "Destination port", dataType: "string" },
	{ name: "Booking number", dataType: "string" },
	{ name: "Shipping company", dataType: "string" },
	{ name: "Vessel", dataType: "string" },
	{ name: "Importer", dataType: "string" },
	{ name: "Cargo", dataType: "string" },
	{ name: "Berthing date", dataType: "date" },
	{ name: "TC 20 ft", dataType: "boolean" },
	{ name: "TC 20 count", dataType: "number" },
	{ name: "TC 40 ft", dataType: "boolean" },
	{ name: "TC 40 count", dataType: "number" },
	{ name: "Vessel name", dataType: "string" },
	{ name: "Expeditor customer code", dataType: "string" },
];

export const PARAMETRIZATION: Record<
	GoodsType,
	{ attributeName: string; isRequired: boolean }[]
> = {
	[GoodsType.CEREALS]: [
		{ attributeName: "Cereal type", isRequired: true },
		{ attributeName: "Cargo", isRequired: true },
		{ attributeName: "Berthing date", isRequired: true },
		{ attributeName: "Importer", isRequired: true },
		{ attributeName: "Vessel", isRequired: true },
		{ attributeName: "Vessel name", isRequired: true },
		{ attributeName: "Expeditor customer code", isRequired: true },
	],
	[GoodsType.CONTAINERS_TC]: [
		{ attributeName: "Container type", isRequired: true },
		{ attributeName: "Origin port", isRequired: true },
		{ attributeName: "Destination port", isRequired: true },
	],
	[GoodsType.PHOSPHATE]: [],
	[GoodsType.HYDROCARBONS]: [],
	[GoodsType.ORES]: [],
	[GoodsType.CHEMICALS]: [],
	[GoodsType.BUILDING_MATERIALS]: [],
	[GoodsType.AGRICULTURAL_PRODUCTS]: [],
	[GoodsType.OTHER]: [],
};

export const LEGACY_UNITS = [
	"Tonne",
	"Kilogramme",
	"Wagon",
	"Conteneur",
	"Palette",
	"Mètre cube",
	"Litre",
];
