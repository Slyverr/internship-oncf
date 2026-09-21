export function stripSwaggerInternalMetadata(value: unknown): void {
	if (value === null || typeof value !== "object") {
		return;
	}

	if (Array.isArray(value)) {
		for (const item of value) {
			stripSwaggerInternalMetadata(item);
		}

		return;
	}

	const object = value as Record<string, unknown>;

	delete object.selfRequired;

	for (const child of Object.values(object)) {
		stripSwaggerInternalMetadata(child);
	}
}
