import { createReferenceId } from "./reference-data.utils";

describe("createReferenceId", () => {
	it("uses stable version 5 IDs for reference values", () => {
		expect(createReferenceId("test", "example")).toBe(
			"74e424e0-76c0-5a81-b1b0-8b1eb9543566",
		);
	});

	it("keeps scopes and names distinct", () => {
		expect(createReferenceId("orders", "DRAFT")).not.toBe(
			createReferenceId("programs", "DRAFT"),
		);
		expect(createReferenceId("orders", "DRAFT")).not.toBe(
			createReferenceId("orders", "APPROVED"),
		);
	});
});
