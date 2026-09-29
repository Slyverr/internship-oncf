import { formatClaimNumber, generateDocumentNumber } from "./document-number";

describe("generateDocumentNumber", () => {
	it("adds a prefix and a ten-character unambiguous code", () => {
		expect(generateDocumentNumber("ORD")).toMatch(
			/^ORD-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/,
		);
	});
});

describe("formatClaimNumber", () => {
	it("formats stable claim identifiers from numeric primary keys", () => {
		expect(formatClaimNumber(1)).toBe("CLM-0000000001");
		expect(formatClaimNumber(928)).toBe("CLM-0000000928");
	});
});
