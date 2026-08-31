import { Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { AuthUser } from "@/auth/auth.types";
import { ROLES } from "@/database/reference-data";
import { CreateUserDto } from "./requests/create-user.dto";
import { UpdateUserDto } from "./requests/update-user.dto";
import { UserInsert, UserUpdate } from "./users.types";

@Injectable()
export class UsersMapper {
	async toCreate(dto: CreateUserDto, user: AuthUser): Promise<UserInsert> {
		const { role, password, ...values } = dto;

		return {
			...values,
			password: await bcrypt.hash(password, 10),
			createdBy: user.email,
			roleId: ROLES[role].id,
		};
	}

	async toUpdate(dto: UpdateUserDto, user: AuthUser): Promise<UserUpdate> {
		const { role, ...values } = dto;

		return {
			...values,
			...(role && { roleId: ROLES[role].id }),
			updatedBy: user.email,
		};
	}
}
