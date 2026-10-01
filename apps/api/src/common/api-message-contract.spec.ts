import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import * as ts from "typescript";

const apiSource = resolve(__dirname, "..");
const httpExceptionNames = new Set([
	"HttpException",
	"BadRequestException",
	"UnauthorizedException",
	"ForbiddenException",
	"NotFoundException",
	"ConflictException",
	"GoneException",
	"InternalServerErrorException",
	"NotImplementedException",
	"ServiceUnavailableException",
	"UnprocessableEntityException",
]);

function collectProductionFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return collectProductionFiles(path);
		return entry.isFile() &&
			/\.ts$/.test(entry.name) &&
			!entry.name.endsWith(".spec.ts")
			? [path]
			: [];
	});
}

function literalText(node: ts.Expression): string | undefined {
	if (ts.isStringLiteralLike(node)) return node.text;
	if (ts.isTemplateExpression(node)) {
		return [
			node.head.text,
			...node.templateSpans.map(({ literal }) => literal.text),
		]
			.join("")
			.trim();
	}
	return undefined;
}

function findLiteralHttpExceptionMessages(source: string): string[] {
	const file = ts.createSourceFile(
		"api-source.ts",
		source,
		ts.ScriptTarget.Latest,
		true,
	);
	const messages: string[] = [];
	function visit(node: ts.Node) {
		if (
			ts.isNewExpression(node) &&
			ts.isIdentifier(node.expression) &&
			httpExceptionNames.has(node.expression.text)
		) {
			const [firstArgument] = node.arguments ?? [];
			if (firstArgument) {
				const directMessage = literalText(firstArgument);
				if (directMessage && /[A-Za-z]{2}/.test(directMessage))
					messages.push(directMessage);
				if (ts.isObjectLiteralExpression(firstArgument)) {
					for (const property of firstArgument.properties) {
						if (
							!ts.isPropertyAssignment(property) ||
							property.name.getText(file) !== "message"
						)
							continue;
						const message = literalText(property.initializer);
						if (message && /[A-Za-z]{2}/.test(message)) messages.push(message);
					}
				}
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(file);
	return messages;
}

describe("API message contract", () => {
	it("detects English exception prose passed directly to Nest HTTP exceptions", () => {
		expect(
			findLiteralHttpExceptionMessages(
				`throw new BadRequestException("Invalid order");`,
			),
		).toEqual(["Invalid order"]);
		const interpolatedMessage = [
			"throw new ConflictException({ message: `Order ",
			"$",
			"{code} already exists` });",
		].join("");
		expect(findLiteralHttpExceptionMessages(interpolatedMessage)).toEqual([
			"Order  already exists",
		]);
		expect(
			findLiteralHttpExceptionMessages(
				`throw new ForbiddenException({ code: API_ERROR_CODES.ACCESS_DENIED });`,
			),
		).toEqual([]);
	});

	it("keeps production HTTP exception copy code-based", () => {
		const violations = collectProductionFiles(apiSource).flatMap((file) =>
			findLiteralHttpExceptionMessages(readFileSync(file, "utf8")).map(
				(message) => `${file}: ${message}`,
			),
		);
		expect(violations).toEqual([]);
	});
});
