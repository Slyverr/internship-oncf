import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import ts from "typescript";

const sourceRoot = join(__dirname, "..");
const presentationFields = new Set(["message", "title", "errorMessage"]);

function collectResponseDtos(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return collectResponseDtos(path);
		return entry.name.endsWith(".dto.ts") &&
			relative(sourceRoot, path).split(sep).includes("responses")
			? [path]
			: [];
	});
}

describe("API presentation contract", () => {
	it("keeps response DTOs free of server-authored presentation messages", () => {
		const violations: string[] = [];
		for (const path of collectResponseDtos(sourceRoot)) {
			const source = readFileSync(path, "utf8");
			const sourceFile = ts.createSourceFile(
				path,
				source,
				ts.ScriptTarget.Latest,
				true,
			);
			function visit(node: ts.Node) {
				if (ts.isPropertyDeclaration(node)) {
					const name = node.name.getText(sourceFile).replaceAll('"', "");
					if (presentationFields.has(name)) {
						violations.push(`${relative(sourceRoot, path)}: ${name}`);
					}
				}
				ts.forEachChild(node, visit);
			}
			visit(sourceFile);
		}
		expect(violations).toEqual([]);
	});
});
