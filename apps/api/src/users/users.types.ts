import { users } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { UsersService } from "./users.service";

export type User = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;
export type UserUpdate = Partial<UserInsert>;

export type UserId = User["id"];
export type UserEmail = User["email"];

export type UserList = Awaited<ReturnType<UsersService["findAll"]>>[number];

export type UserDetail = NonNullable<
	Awaited<ReturnType<UsersService["findOne"]>>
>;
export type UserProfile = NonNullable<
	Awaited<ReturnType<UsersService["findProfile"]>>
>;
export type UserDelete = NonNullable<
	Awaited<ReturnType<UsersService["deactivate"]>>
>;
