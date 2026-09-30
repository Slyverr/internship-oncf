import { generateDocumentNumber } from "./document-number";

describe("generateDocumentNumber", () => {
	it("adds a prefix and a ten-character unambiguous code", () => {
		expect(generateDocumentNumber("ORD")).toMatch(
			/^ORD-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/,
		);
	});
});
