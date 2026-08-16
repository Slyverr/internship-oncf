import type { relations } from "drizzle/relations";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type DrizzleDb = NodePgDatabase<typeof relations>;

type QueryKey = keyof DrizzleDb["query"];

type Query<T extends QueryKey> = DrizzleDb["query"][T];

type FindManyArgs<T extends QueryKey> = Parameters<Query<T>["findMany"]>[0];

type QueryOptions<T extends QueryKey> = NonNullable<FindManyArgs<T>>;

export type QueryColumns<T extends QueryKey> =
	QueryOptions<T> extends { columns?: infer C } ? C : never;

export type QueryRelations<T extends QueryKey> =
	QueryOptions<T> extends { with?: infer W } ? W : never;
