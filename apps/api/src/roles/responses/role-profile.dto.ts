import { RolePersona } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";

export class RoleProfileDto {
	id: string;
	name: string;
	description: string | null;
	@ApiProperty({ enum: RolePersona, enumName: "RolePersona", nullable: true })
	persona: RolePersona | null;
	isSystem: boolean;
	isActive: boolean;
	permissionNames: string[];
	createdAt: string;
	updatedAt: string;
}

export class PermissionDefinitionDto {
	name: string;
	@ApiProperty({ required: false })
	parent?: string;
	assignable: boolean;
}
