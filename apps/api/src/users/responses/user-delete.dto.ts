import { Assert, Equals } from "@/common/utils/type-assertions";
import { UserDelete } from "../users.types";

type _Assertion = Assert<Equals<UserDeleteDto, UserDelete>>;

export class UserDeleteDto implements UserDelete {
	id: number;
}
