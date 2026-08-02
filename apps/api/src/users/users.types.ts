import { users } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;

export type UserId = User["id"];
export type UserEmail = User["email"];
