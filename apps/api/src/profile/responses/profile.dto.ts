import { Assert, Equals } from "@/common/utils/type-assertions";
import { Profile } from "../profile.types";

type _Assertion = Assert<Equals<ProfileDto, Profile>>;

export class ProfileDto implements Profile {
	id: number;
	email: string;
	lastName: string;
	firstName: string;
	role: string;
	permissions: string[];
	employeeId: string | null;
	type: string | null;
	roleId: string;
	customerId: number | null;
	agencyId: number | null;
	createdAt: string;
	lastLogin: string | null;
}
