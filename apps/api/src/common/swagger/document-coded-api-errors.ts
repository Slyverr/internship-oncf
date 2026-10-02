type OpenApiDocument = {
	paths?: Record<string, unknown>;
};

type ApiErrorResponse = {
	description: string;
	content: {
		"application/json": {
			schema: { $ref: string };
		};
	};
};

const codedErrorResponse: ApiErrorResponse = {
	description: "Coded API error response",
	content: {
		"application/json": {
			schema: { $ref: "#/components/schemas/ApiErrorResponseDto" },
		},
	},
};

export function documentDefaultCodedApiErrors(document: OpenApiDocument) {
	for (const pathItem of Object.values(document.paths ?? {})) {
		if (typeof pathItem !== "object" || pathItem === null) continue;

		for (const operation of Object.values(pathItem)) {
			if (
				typeof operation !== "object" ||
				operation === null ||
				!("responses" in operation)
			) {
				continue;
			}

			const responses = operation.responses;
			if (typeof responses !== "object" || responses === null) continue;

			const responseMap = responses as Record<string, unknown>;
			responseMap.default ??= codedErrorResponse;
		}
	}
}
