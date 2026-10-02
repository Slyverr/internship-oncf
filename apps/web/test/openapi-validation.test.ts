import { validateOpenApiForGeneration } from "../scripts/openapi-validation";

const completeSchema = {
	properties: Object.fromEntries(
		Array.from({ length: 12 }, (_, index) => [`field${index}`, {}]),
	),
};
const codedErrorOperation = {
	responses: {
		default: {
			content: {
				"application/json": {
					schema: { $ref: "#/components/schemas/ApiErrorResponseDto" },
				},
			},
		},
	},
};

const issues = validateOpenApiForGeneration({
	paths: { "/orders": { get: codedErrorOperation } },
	components: {
		schemas: {
			ApiErrorCode: { enum: ["ACCESS_DENIED"] },
			ApiErrorResponseDto: { properties: { code: {}, statusCode: {} } },
			CreateOrderDto: completeSchema,
			CreateUserDto: completeSchema,
			OrderDetailDto: completeSchema,
			ClaimDetailDto: completeSchema,
			ProgramDetailDto: completeSchema,
		},
	},
});
if (issues.length !== 0)
	throw new Error(`Expected complete OpenAPI schema to pass: ${issues}`);

const incompleteIssues = validateOpenApiForGeneration({
	paths: { "/orders": {} },
	components: {
		schemas: { UserListDto: { properties: { registrationStatus: {} } } },
	},
});
if (
	!incompleteIssues.includes(
		"The OpenAPI document has no shared ApiErrorCode enum.",
	) ||
	!incompleteIssues.includes(
		"The OpenAPI document has no coded API error response schema.",
	)
) {
	throw new Error(
		`Expected incomplete error schemas to block generation: ${incompleteIssues}`,
	);
}

const emptyIssues = validateOpenApiForGeneration({
	paths: {},
	components: { schemas: {} },
});
if (!emptyIssues.includes("The OpenAPI document has no paths.")) {
	throw new Error("Expected an empty OpenAPI document to fail preflight.");
}

console.info("OpenAPI generation preflight checks passed.");
