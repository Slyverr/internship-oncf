import { v5 as uuidv5 } from "uuid";

const REFERENCE_NAMESPACE = "46851189-fe54-487a-9615-e32e32267999";

export interface ReferenceItem {
	id: string;
	name: string;
	description?: string;
}

export type ReferenceMap = Record<string, ReferenceItem>;

export function createReferenceId(scope: string, name: string): string {
	return uuidv5(`${scope}:${name}`, REFERENCE_NAMESPACE);
}

export function createReferenceMap(
	scope: string,
	items: Record<string, string | undefined>,
): ReferenceMap {
	return Object.fromEntries(
		Object.entries(items).map(([name, description]) => [
			name,
			{
				id: createReferenceId(scope, name),
				name,
				...(description ? { description } : {}),
			},
		]),
	);
}

export function createEnumReferenceMap(
	scope: string,
	enumObject: Record<string, string>,
): ReferenceMap {
	return createReferenceMap(
		scope,
		Object.fromEntries(
			Object.values(enumObject).map((value) => [value, undefined]),
		),
	);
}

export function createGroupedReferenceMap(
	scope: string,
	groups: readonly Record<string, string | undefined>[],
): ReferenceMap {
	return Object.assign(
		{},
		...groups.map((group) => createReferenceMap(scope, group)),
	);
}
