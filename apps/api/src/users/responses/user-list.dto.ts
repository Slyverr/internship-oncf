import { RegistrationStatus } from "@ecommand/shared";
import { ApiProperty } from "@nestjs/swagger";
import { Assert, Equals } from "@/common/utils/type-assertions";
import { UserList } from "../users.types";

type _Assertion = Assert<Equals<UserListDto, UserList>>;

export class UserListDto implements UserList {
	id: number;
	email: string;
	lastName: string;
	firstName: string;
	employeeCode: string | null;
	type: string | null;
	roleId: string;
	@ApiProperty({ enum: RegistrationStatus, enumName: "RegistrationStatus" })
	registrationStatus: RegistrationStatus;
	role: { id: string; name: string } | null;
	customerId: number | null;
	userCustomers: { customerId: number }[];
	agencyId: number | null;
	createdAt: string;
	updatedAt: string;
	isActive: boolean;
	lastLogin: string | null;
}
