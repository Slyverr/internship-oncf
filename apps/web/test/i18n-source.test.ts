import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
const files: string[] = [];

function collectFiles(directory: string) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) collectFiles(path);
		else if (
			/\.tsx?$/.test(entry.name) &&
			!path.includes("/i18n/") &&
			!path.includes("/lib/api/generated.")
		) {
			files.push(path);
		}
	}
}

function isAriaHidden(node: ts.Node) {
	for (
		let current: ts.Node | undefined = node.parent;
		current;
		current = current.parent
	) {
		if (!ts.isJsxElement(current) && !ts.isJsxSelfClosingElement(current)) {
			continue;
		}
		const properties = ts.isJsxElement(current)
			? current.openingElement.attributes.properties
			: current.attributes.properties;
		const ariaHidden = properties.some((property) => {
			if (
				!ts.isJsxAttribute(property) ||
				property.name.getText() !== "aria-hidden" ||
				!property.initializer
			) {
				return false;
			}
			if (ts.isStringLiteral(property.initializer)) {
				return property.initializer.text === "true";
			}
			return (
				ts.isJsxExpression(property.initializer) &&
				property.initializer.expression?.kind === ts.SyntaxKind.TrueKeyword
			);
		});
		if (ariaHidden) {
			return true;
		}
	}
	return false;
}

function isRawJsxTextExpression(node: ts.Node) {
	const expression = node.parent;
	if (
		!ts.isJsxExpression(expression) ||
		expression.expression !== node ||
		!expression.parent
	) {
		return false;
	}
	return (
		ts.isJsxElement(expression.parent) || ts.isJsxFragment(expression.parent)
	);
}

function getCopyText(node: ts.Expression): string | undefined {
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
		return node.text;
	}
	if (ts.isTemplateExpression(node)) {
		return [
			node.head.text,
			...node.templateSpans.map((span) => span.literal.text),
		]
			.map((text) => text.trim())
			.filter(Boolean)
			.join(" ");
	}
	return undefined;
}

const interpolatedCopyFixture = ts.createSourceFile(
	"interpolated-copy.ts",
	"const ariaLabel = `Open ${" + "recordCode}`;",
	ts.ScriptTarget.Latest,
	true,
);
const fixtureStatement = interpolatedCopyFixture.statements[0];
assert.ok(ts.isVariableStatement(fixtureStatement));
const fixtureInitializer =
	fixtureStatement.declarationList.declarations[0]?.initializer;
assert.ok(fixtureInitializer && ts.isTemplateExpression(fixtureInitializer));
assert.equal(getCopyText(fixtureInitializer), "Open");

collectFiles(sourceRoot);
const violations: string[] = [];
const userFacingAttributes = new Set([
	"alt",
	"aria-description",
	"aria-label",
	"description",
	"errorMessage",
	"label",
	"message",
	"notice",
	"placeholder",
	"prompt",
	"text",
	"title",
]);
const userFacingProperties = new Set([
	"ariaDescription",
	"ariaLabel",
	"body",
	"caption",
	"description",
	"emptyMessage",
	"errorMessage",
	"header",
	"helperText",
	"label",
	"message",
	"notice",
	"placeholder",
	"prompt",
	"subject",
	"text",
	"successMessage",
	"title",
	"tooltip",
]);
const copyVariableName =
	/(?:title|description|label|placeholder|helperText|tooltip|emptyMessage|errorMessage|successMessage|ariaLabel|ariaDescription|message|copy|hint|notice|prompt|text)$/i;

for (const file of files) {
	const source = readFileSync(file, "utf8");
	const sourceFile = ts.createSourceFile(
		file,
		source,
		ts.ScriptTarget.Latest,
		true,
		file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	function visit(node: ts.Node) {
		const isVisibleText =
			ts.isJsxText(node) ||
			((ts.isStringLiteral(node) ||
				ts.isNoSubstitutionTemplateLiteral(node) ||
				ts.isTemplateExpression(node)) &&
				isRawJsxTextExpression(node));
		const text = ts.isJsxText(node)
			? node.getText(sourceFile).trim()
			: ts.isStringLiteral(node) ||
					ts.isNoSubstitutionTemplateLiteral(node) ||
					ts.isTemplateExpression(node)
				? (getCopyText(node) ?? "")
				: "";
		if (
			isVisibleText &&
			text &&
			/[A-Za-z]{2}/.test(text) &&
			!isAriaHidden(node)
		) {
			const line =
				sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
					.line + 1;
			violations.push(
				`${file}:${line}: visible JSX text must use the message catalog: ${JSON.stringify(text)}`,
			);
		}
		if (
			ts.isJsxAttribute(node) &&
			userFacingAttributes.has(node.name.getText(sourceFile)) &&
			node.initializer
		) {
			const expression = ts.isJsxExpression(node.initializer)
				? node.initializer.expression
				: undefined;
			const value = ts.isStringLiteral(node.initializer)
				? node.initializer.text
				: expression
					? getCopyText(expression)
					: undefined;
			if (value && /[A-Za-z]{2}/.test(value)) {
				const line =
					sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
						.line + 1;
				violations.push(
					`${file}:${line}: ${node.name.getText(sourceFile)} must use the message catalog: ${JSON.stringify(value)}`,
				);
			}
		}
		const propertyCopy = ts.isPropertyAssignment(node)
			? getCopyText(node.initializer)
			: undefined;
		if (
			ts.isPropertyAssignment(node) &&
			userFacingProperties.has(
				node.name.getText(sourceFile).replaceAll('"', ""),
			) &&
			propertyCopy &&
			/[A-Za-z]{2}/.test(propertyCopy)
		) {
			const line =
				sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
					.line + 1;
			violations.push(
				`${file}:${line}: ${node.name.getText(sourceFile)} copy must use the message catalog: ${JSON.stringify(propertyCopy)}`,
			);
		}
		const variableCopy = ts.isVariableDeclaration(node)
			? node.initializer
				? getCopyText(node.initializer)
				: undefined
			: undefined;
		if (
			ts.isVariableDeclaration(node) &&
			copyVariableName.test(node.name.getText(sourceFile)) &&
			variableCopy &&
			/[A-Za-z]{2}/.test(variableCopy)
		) {
			const line =
				sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
					.line + 1;
			violations.push(
				`${file}:${line}: ${node.name.getText(sourceFile)} copy must use the message catalog: ${JSON.stringify(variableCopy)}`,
			);
		}
		ts.forEachChild(node, visit);
	}
	visit(sourceFile);
}

assert.deepEqual(violations, [], violations.join("\n"));
console.log(
	"No static UI copy literals found outside the message catalog in JSX, UI properties, or copy-named constants.",
);
