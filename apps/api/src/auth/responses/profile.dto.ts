import { Permission } from "@ecommand/shared";
import { Transform } from "class-transformer";

export class ProfileDto {
	id: number;
	email: string;
	role?: string;

	@Transform(({ value }) => Array.from(value))
	permissions: Permission[];
}
