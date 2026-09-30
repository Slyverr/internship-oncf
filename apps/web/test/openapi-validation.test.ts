import { validateOpenApiForGeneration } from "../scripts/openapi-validation";

const completeSchema = {
	properties: Object.fromEntries(
		Array.from({ length: 12 }, (_, index) => [`field${index}`, {}]),
	),
};

const issues = validateOpenApiForGeneration({
	paths: { "/orders": {} },
	components: {
		schemas: {
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
if (incompleteIssues.length !== 5) {
	throw new Error(
		`Expected incomplete schemas to block generation, got ${incompleteIssues.length} issue(s).`,
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
