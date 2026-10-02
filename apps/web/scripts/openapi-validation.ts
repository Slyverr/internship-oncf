type OpenApiDocument = {
	components?: {
		schemas?: Record<
			string,
			{ enum?: unknown[]; properties?: Record<string, unknown> }
		>;
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
	const schemas = spec.components?.schemas;
	if (!schemas?.ApiErrorCode?.enum?.length) {
		issues.push("The OpenAPI document has no shared ApiErrorCode enum.");
	}
	if (
		!schemas?.ApiErrorResponseDto?.properties?.code ||
		!schemas.ApiErrorResponseDto.properties.statusCode
	) {
		issues.push("The OpenAPI document has no coded API error response schema.");
	}

	for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
		if (typeof pathItem !== "object" || pathItem === null) continue;
		for (const [method, candidate] of Object.entries(pathItem)) {
			if (
				typeof candidate !== "object" ||
				candidate === null ||
				!("responses" in candidate)
			) {
				continue;
			}
			const responses = candidate.responses;
			const defaultResponse =
				typeof responses === "object" && responses !== null
					? (responses as Record<string, unknown>).default
					: undefined;
			const content =
				typeof defaultResponse === "object" && defaultResponse !== null
					? (defaultResponse as Record<string, unknown>).content
					: undefined;
			const jsonResponse =
				typeof content === "object" && content !== null
					? (content as Record<string, unknown>)["application/json"]
					: undefined;
			const schema =
				typeof jsonResponse === "object" && jsonResponse !== null
					? (jsonResponse as Record<string, unknown>).schema
					: undefined;
			if (
				typeof schema !== "object" ||
				schema === null ||
				(schema as Record<string, unknown>).$ref !==
					"#/components/schemas/ApiErrorResponseDto"
			) {
				issues.push(
					`${method.toUpperCase()} ${path} has no default coded API error response.`,
				);
			}
		}
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
