import {
	AccessoryOperation,
	CustomerType,
	GoodsType,
	Unit,
} from "@ecommand/shared";

export const CUSTOMER_TYPES: Record<
	CustomerType,
	{ id: number; name: CustomerType }
> = {
	[CustomerType.INDUSTRIAL]: { id: 1, name: CustomerType.INDUSTRIAL },
	[CustomerType.COMMERCIAL]: { id: 2, name: CustomerType.COMMERCIAL },
	[CustomerType.AGRICULTURAL]: { id: 3, name: CustomerType.AGRICULTURAL },
	[CustomerType.MINING]: { id: 4, name: CustomerType.MINING },
	[CustomerType.PETROLEUM]: { id: 5, name: CustomerType.PETROLEUM },
	[CustomerType.FREIGHT_FORWARDER]: {
		id: 6,
		name: CustomerType.FREIGHT_FORWARDER,
	},
	[CustomerType.OTHER]: { id: 7, name: CustomerType.OTHER },
};

export const GOODS_TYPES: Record<GoodsType, { id: number; name: GoodsType }> = {
	[GoodsType.CEREALS]: { id: 1, name: GoodsType.CEREALS },
	[GoodsType.CONTAINERS_TC]: { id: 2, name: GoodsType.CONTAINERS_TC },
	[GoodsType.PHOSPHATE]: { id: 3, name: GoodsType.PHOSPHATE },
	[GoodsType.HYDROCARBONS]: { id: 4, name: GoodsType.HYDROCARBONS },
	[GoodsType.ORES]: { id: 5, name: GoodsType.ORES },
	[GoodsType.CHEMICALS]: { id: 6, name: GoodsType.CHEMICALS },
	[GoodsType.BUILDING_MATERIALS]: { id: 7, name: GoodsType.BUILDING_MATERIALS },
	[GoodsType.AGRICULTURAL_PRODUCTS]: {
		id: 8,
		name: GoodsType.AGRICULTURAL_PRODUCTS,
	},
	[GoodsType.OTHER]: { id: 9, name: GoodsType.OTHER },
};

export const ATTRIBUTES: { id: number; name: string; dataType: string }[] = [
	{ id: 1, name: "Cereal type", dataType: "string" },
	{ id: 2, name: "Weight", dataType: "decimal" },
	{ id: 3, name: "Container type", dataType: "string" },
	{ id: 4, name: "Origin port", dataType: "string" },
	{ id: 5, name: "Destination port", dataType: "string" },
	{ id: 6, name: "Booking number", dataType: "string" },
	{ id: 7, name: "Shipping company", dataType: "string" },
	{ id: 8, name: "Vessel", dataType: "string" },
	{ id: 9, name: "Importer", dataType: "string" },
	{ id: 10, name: "Cargo", dataType: "string" },
	{ id: 11, name: "Berthing date", dataType: "date" },
	{ id: 12, name: "TC 20 ft", dataType: "boolean" },
	{ id: 13, name: "TC 20 count", dataType: "number" },
	{ id: 14, name: "TC 40 ft", dataType: "boolean" },
	{ id: 15, name: "TC 40 count", dataType: "number" },
	{ id: 16, name: "Vessel name", dataType: "string" },
	{ id: 17, name: "Expeditor customer code", dataType: "string" },
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

export const UNITS: Record<Unit, { id: number; name: Unit }> = {
	[Unit.TONNES]: { id: 1, name: Unit.TONNES },
	[Unit.TC20]: { id: 2, name: Unit.TC20 },
	[Unit.TC40]: { id: 3, name: Unit.TC40 },
};

export const ACCESSORY_OPERATIONS: Record<
	AccessoryOperation,
	{ id: number; name: AccessoryOperation }
> = {
	[AccessoryOperation.WEIGHING]: { id: 1, name: AccessoryOperation.WEIGHING },
	[AccessoryOperation.WAGON_PUSH]: {
		id: 2,
		name: AccessoryOperation.WAGON_PUSH,
	},
	[AccessoryOperation.SCANNING]: { id: 3, name: AccessoryOperation.SCANNING },
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
