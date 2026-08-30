import { Attribute } from "../enums";

export enum AttributeDataType {
	STRING = "string",
	DECIMAL = "decimal",
	BOOLEAN = "boolean",
	NUMBER = "number",
	DATE = "date",
}

export const ATTRIBUTE_DEFINITIONS: Record<Attribute, AttributeDataType> = {
	[Attribute.CEREAL_TYPE]: AttributeDataType.STRING,
	[Attribute.WEIGHT]: AttributeDataType.DECIMAL,
	[Attribute.CONTAINER_TYPE]: AttributeDataType.STRING,
	[Attribute.ORIGIN_PORT]: AttributeDataType.STRING,
	[Attribute.DESTINATION_PORT]: AttributeDataType.STRING,
	[Attribute.BOOKING_NUMBER]: AttributeDataType.STRING,
	[Attribute.SHIPPING_COMPANY]: AttributeDataType.STRING,
	[Attribute.VESSEL]: AttributeDataType.STRING,
	[Attribute.IMPORTER]: AttributeDataType.STRING,
	[Attribute.CARGO]: AttributeDataType.STRING,
	[Attribute.BERTHING_DATE]: AttributeDataType.DATE,
	[Attribute.TC_20_FT]: AttributeDataType.BOOLEAN,
	[Attribute.TC_20_COUNT]: AttributeDataType.NUMBER,
	[Attribute.TC_40_FT]: AttributeDataType.BOOLEAN,
	[Attribute.TC_40_COUNT]: AttributeDataType.NUMBER,
	[Attribute.VESSEL_NAME]: AttributeDataType.STRING,
	[Attribute.EXPEDITOR_CUSTOMER_CODE]: AttributeDataType.STRING,
};
