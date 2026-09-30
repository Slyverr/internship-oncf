type OpenApiDocument = {
	components?: {
		schemas?: Record<string, { properties?: Record<string, unknown> }>;
	};
	paths?: Record<string, unknown>;
};

const requiredSchemaProperties = {
	CreateOrderDto: 5,
	CreateUserDto: 5,
	OrderDetailDto: 10,
	ClaimDetailDto: 10,
	ProgramDetailDto: 10,
} as const;

export function validateOpenApiForGeneration(document: unknown): string[] {
	if (!document || typeof document !== "object") {
		return ["The OpenAPI response is not a JSON object."];
	}

	const spec = document as OpenApiDocument;
	const issues: string[] = [];
	if (!spec.paths || Object.keys(spec.paths).length === 0) {
		issues.push("The OpenAPI document has no paths.");
	}

	for (const [name, minimumProperties] of Object.entries(
		requiredSchemaProperties,
	)) {
		const schema = spec.components?.schemas?.[name];
		const propertyCount = schema?.properties
			? Object.keys(schema.properties).length
			: 0;

		if (propertyCount < minimumProperties) {
			issues.push(
				`${name} exposes ${propertyCount} properties; expected at least ${minimumProperties}.`,
			);
		}
	}

	return issues;
}
