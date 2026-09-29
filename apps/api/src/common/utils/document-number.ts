import { randomInt } from "node:crypto";

const DOCUMENT_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode() {
	return Array.from({ length: 10 }, () =>
		DOCUMENT_NUMBER_ALPHABET.at(randomInt(DOCUMENT_NUMBER_ALPHABET.length)),
	).join("");
}

export function generateDocumentNumber(prefix: string) {
	return `${prefix}-${generateCode()}`;
}

export function formatClaimNumber(id: number) {
	return `CLM-${String(id).padStart(10, "0")}`;
}
