import { RegistrationStatus } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";
import { Assert, Equals } from "@/common/utils/type-assertions";
import { UserDetail } from "../users.types";
import { UserRoleDto } from "./user-role.dto";

type _Assertion = Assert<Equals<UserDetailDto, UserDetail>>;

export class UserDetailDto implements UserDetail {
	id: number;
	email: string;
	lastName: string;
	firstName: string;
	employeeCode: string | null;
	type: string | null;
	roleId: string;
	@ApiProperty({ enum: RegistrationStatus, enumName: "RegistrationStatus" })
	registrationStatus: RegistrationStatus;
	@ApiProperty({ type: () => UserRoleDto, nullable: true })
	role: UserRoleDto | null;
	customerId: number | null;
	userCustomers: { customerId: number }[];
	agencyId: number | null;
	createdAt: string;
	updatedAt: string;
	isActive: boolean;
	lastLogin: string | null;
}
