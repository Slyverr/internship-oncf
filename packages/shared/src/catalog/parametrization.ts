import { Attribute, GoodsType } from "../enums";

export const DEFAULT_PARAMETRIZATION: Record<GoodsType, Attribute[]> = {
	[GoodsType.CEREALS]: [
		Attribute.CEREAL_TYPE,
		Attribute.CARGO,
		Attribute.BERTHING_DATE,
		Attribute.IMPORTER,
		Attribute.VESSEL,
		Attribute.VESSEL_NAME,
		Attribute.EXPEDITOR_CUSTOMER_CODE,
	],
	[GoodsType.CONTAINERS_TC]: [
		Attribute.CONTAINER_TYPE,
		Attribute.ORIGIN_PORT,
		Attribute.DESTINATION_PORT,
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
] as const;
