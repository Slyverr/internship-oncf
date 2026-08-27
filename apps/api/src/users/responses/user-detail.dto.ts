import { Assert, Equals } from "@/common/utils/type-assertions";
import { UserDetail } from "../users.types";

type _Assertion = Assert<Equals<UserDetailDto, UserDetail>>;

export class UserDetailDto implements UserDetail {
	id: number;
	email: string;
	lastName: string;
	firstName: string;
	employeeId: string | null;
	type: string | null;
	roleId: string;
	customerId: number | null;
	agencyId: number | null;
	createdAt: string;
	updatedAt: string;
	isActive: boolean;
	lastLogin: string | null;
}
