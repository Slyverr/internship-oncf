import { Permission } from "@ecommand/shared";
import {
	ArrayNotEmpty,
	ArrayUnique,
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsString,
	MaxLength,
} from "class-validator";

export class CreateIntegrationCredentialDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	name: string;

	@IsArray()
	@ArrayNotEmpty()
	@ArrayUnique()
	@IsEnum(Permission, { each: true })
	permissions: Permission[];
}
