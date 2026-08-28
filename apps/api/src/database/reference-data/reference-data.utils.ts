import { v5 as uuidv5 } from "uuid";

const REFERENCE_NAMESPACE = "46851189-fe54-487a-9615-e32e32267999";

export interface ReferenceItem {
	id: string;
	name: string;
	description?: string;
}

export type ReferenceMap<T> = Record<string, T>;

export type ReferenceMapper<TInput, TOutput> = (
	name: string,
	value: TInput,
) => TOutput;

export function createReferenceId(scope: string, name: string): string {
	return uuidv5(`${scope}:${name}`, REFERENCE_NAMESPACE);
}

export function defaultReferenceMapper(
	scope: string,
): ReferenceMapper<string | null | undefined, ReferenceItem> {
	return (name, description) => ({
		id: createReferenceId(scope, name),
		name,
		...(description != null ? { description } : {}),
	});
}

export function enumReferenceMapper(
	scope: string,
): ReferenceMapper<string, ReferenceItem> {
	return (name) => ({
		id: createReferenceId(scope, name),
		name,
	});
}

export function createReferenceMap<TInput, TOutput>(
	items: Record<string, TInput>,
	mapper: ReferenceMapper<TInput, TOutput>,
): ReferenceMap<TOutput> {
	return Object.fromEntries(
		Object.entries(items).map(([name, value]) => [name, mapper(name, value)]),
	);
}
