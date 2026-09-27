import { createHash } from "node:crypto";

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

function uuidV5(name: string, namespace: string): string {
	const namespaceBytes = Buffer.from(namespace.replaceAll("-", ""), "hex");
	const digest = createHash("sha1")
		.update(namespaceBytes)
		.update(name)
		.digest();

	digest.writeUInt8((digest.readUInt8(6) & 0x0f) | 0x50, 6);
	digest.writeUInt8((digest.readUInt8(8) & 0x3f) | 0x80, 8);

	const hex = digest.subarray(0, 16).toString("hex");
	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createReferenceId(scope: string, name: string): string {
	return uuidV5(`${scope}:${name}`, REFERENCE_NAMESPACE);
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
