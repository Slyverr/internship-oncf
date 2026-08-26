import { customAlphabet } from "nanoid";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);

export function generateDocumentNumber(prefix: string) {
	return `${prefix}-${generateCode()}`;
}
