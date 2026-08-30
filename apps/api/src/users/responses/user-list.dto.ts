import { Assert, Equals } from "@/common/utils/type-assertions";
import { UserList } from "../users.types";

type _Assertion = Assert<Equals<UserListDto, UserList>>;

export class UserListDto implements UserList {
	id: number;
	email: string;
	lastName: string;
	firstName: string;
	employeeId: string | null;
	type: string | null;
	roleId: string;
	role: { id: string; name: string } | null;
	customerId: number | null;
	agencyId: number | null;
	createdAt: string;
	updatedAt: string;
	isActive: boolean;
	lastLogin: string | null;
}
