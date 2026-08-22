import { Assert, Equals } from "src/common/utils/type-assertions";
import { UserProfile } from "../users.types";

type _Assertion = Assert<Equals<ProfileDto, UserProfile>>;

export class ProfileDto implements UserProfile {
	id: number;
	email: string;
	lastName: string;
	firstName: string;
	role: string;
	permissions: string[];
	employeeId: string | null;
	type: string | null;
	roleId: number;
	customerId: number | null;
	agencyId: number | null;
	createdAt: string;
	lastLogin: string | null;
}
