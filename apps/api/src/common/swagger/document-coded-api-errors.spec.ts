import assert from "node:assert/strict";
import { documentDefaultCodedApiErrors } from "./document-coded-api-errors";

describe("documentDefaultCodedApiErrors", () => {
	it("adds the shared response as the default without replacing explicit responses", () => {
		const document = {
			paths: {
				"/orders": {
					get: { responses: { "200": { description: "Orders" } } },
					parameters: [{ name: "unused path metadata" }],
				},
				"/health": {
					get: {
						responses: {
							"200": { description: "Healthy" },
							default: { description: "Existing default" },
						},
					},
				},
			},
		};

		documentDefaultCodedApiErrors(document);

		assert.deepEqual(
			(document.paths["/orders"].get.responses as Record<string, unknown>)
				.default,
			{
				description: "Coded API error response",
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/ApiErrorResponseDto",
						},
					},
				},
			},
		);
		assert.deepEqual(
			(document.paths["/health"].get.responses as Record<string, unknown>)
				.default,
			{ description: "Existing default" },
		);
	});
});
