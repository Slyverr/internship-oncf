import type { relations } from "drizzle/relations";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type DrizzleDb = NodePgDatabase<typeof relations>;

type QueryKey = keyof DrizzleDb["query"];

type Query<T extends QueryKey> = DrizzleDb["query"][T];

type QueryArgs<T extends QueryKey> = Parameters<Query<T>["findMany"]>[0];

type QueryOptions<T extends QueryKey> = NonNullable<QueryArgs<T>>;

export type QueryColumns<T extends QueryKey> =
	QueryOptions<T> extends { columns?: infer C } ? C : never;

export type QueryRelations<T extends QueryKey> =
	QueryOptions<T> extends { with?: infer W } ? W : never;

export type FindManyQueryOptions<T extends QueryKey> = NonNullable<
	Parameters<Query<T>["findMany"]>[0]
>;

export type FindFirstQueryOptions<T extends QueryKey> = NonNullable<
	Parameters<Query<T>["findFirst"]>[0]
>;
