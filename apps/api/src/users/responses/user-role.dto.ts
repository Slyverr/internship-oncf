import { RolePersona } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";

export class UserRoleDto {
	id: string;
	name: string;
	@ApiProperty({ enum: RolePersona, enumName: "RolePersona", nullable: true })
	persona: RolePersona | null;
}
