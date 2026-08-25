import bcrypt from "bcryptjs";
import { AuthUser } from "src/auth/auth.types";
import { ROLES } from "src/database/reference-data";
import { CreateUserDto } from "./requests/create-user.dto";
import { UpdateUserDto } from "./requests/update-user.dto";
import { UserInsert, UserUpdate } from "./users.types";

export const toCreate = async (
	dto: CreateUserDto,
	user: AuthUser,
): Promise<UserInsert> => {
	const { role, password, ...values } = dto;

	return {
		...values,
		password: await bcrypt.hash(password, 10),
		createdBy: user.email,
		roleId: ROLES[role].id,
	};
};

export const toUpdate = (dto: UpdateUserDto, user: AuthUser): UserUpdate => {
	const { role, ...values } = dto;

	return {
		...values,
		...(role && { roleId: ROLES[role].id }),
		updatedBy: user.email,
	};
};
