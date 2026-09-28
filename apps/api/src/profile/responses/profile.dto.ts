import { ApiProperty } from "@nestjs/swagger";
import { Assert, Equals } from "@/common/utils/type-assertions";
import { Profile } from "../profile.types";

type _Assertion = Assert<Equals<ProfileDto, Profile>>;

export class ProfileDto implements Profile {
	@ApiProperty()
	id: number;
	@ApiProperty()
	email: string;
	@ApiProperty()
	lastName: string;
	@ApiProperty()
	firstName: string;
	@ApiProperty()
	role: string;
	@ApiProperty({ type: [String] })
	permissions: string[];
	@ApiProperty({ nullable: true })
	employeeCode: string | null;
	@ApiProperty({ nullable: true })
	type: string | null;
	@ApiProperty()
	roleId: string;
	@ApiProperty({ nullable: true })
	customerId: number | null;
	@ApiProperty({ nullable: true })
	customerName: string | null;
	@ApiProperty({ nullable: true })
	customerCode: string | null;
	@ApiProperty({ nullable: true })
	agencyId: number | null;
	@ApiProperty()
	createdAt: string;
	@ApiProperty({ nullable: true })
	lastLogin: string | null;
}
