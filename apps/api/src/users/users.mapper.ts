import { RegistrationStatus, Role } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { AuthUser } from "@/auth/auth.types";
import { ROLES } from "@/database/reference-data";
import { CreateUserDto } from "./requests/create-user.dto";
import { UpdateUserDto } from "./requests/update-user.dto";
import { ClientRegistrationInput, UserInsert, UserUpdate } from "./users.types";

@Injectable()
export class UsersMapper {
	private normalizeEmployeeCode(employeeCode?: string) {
		const normalized = employeeCode?.trim().toUpperCase();
		return normalized || undefined;
	}

	async toRegistration(input: ClientRegistrationInput): Promise<UserInsert> {
		const { password, ...values } = input;
		return {
			...values,
			password: await bcrypt.hash(password, 10),
			roleId: ROLES[Role.CLIENT_REPRESENTATIVE].id,
			type: "external",
			registrationStatus: RegistrationStatus.PENDING,
			isActive: false,
			createdBy: "self-registration",
		};
	}

	async toCreate(dto: CreateUserDto, user: AuthUser): Promise<UserInsert> {
		const { role, password, customerIds: _, ...values } = dto;

		return {
			...values,
			employeeCode: this.normalizeEmployeeCode(values.employeeCode),
			password: await bcrypt.hash(password, 10),
			createdBy: user.email,
			roleId: ROLES[role].id,
		};
	}

	async toUpdate(dto: UpdateUserDto, user: AuthUser): Promise<UserUpdate> {
		const { role, customerIds: _, ...values } = dto;

		return {
			...values,
			...(values.employeeCode !== undefined && {
				employeeCode: this.normalizeEmployeeCode(values.employeeCode),
			}),
			...(role && { roleId: ROLES[role].id }),
			updatedBy: user.email,
		};
	}
}
