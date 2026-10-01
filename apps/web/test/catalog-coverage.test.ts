import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import ts from "typescript";

const sourceRoot = resolve(process.cwd(), "src");
const translatableAttributes = new Set([
	"alt",
	"aria-description",
	"aria-label",
	"placeholder",
	"title",
]);
const translatableProperties = new Set([
	"alt",
	"ariaLabel",
	"button",
	"caption",
	"description",
	"empty",
	"emptyMessage",
	"emptyText",
	"error",
	"errorMessage",
	"header",
	"hint",
	"helperText",
	"label",
	"loading",
	"message",
	"noResults",
	"placeholder",
	"success",
	"successMessage",
	"text",
	"title",
	"tooltip",
]);
const intentionalSamples = new Set([
	"components/sidebar/sidebar-logo.tsx:ONCF",
	"components/settings/settings-panel.tsx:Aa",
	"components/settings/settings-panel.tsx:Ag",
]);
const untranslated: string[] = [];
const inlineTranslationKeys: string[] = [];

async function findSourceFiles(folder: string): Promise<string[]> {
	const entries = await readdir(folder, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry) => {
			const path = resolve(folder, entry.name);
			if (entry.isDirectory()) return findSourceFiles(path);
			return /\.tsx?$/.test(entry.name) ? [path] : [];
		}),
	);
	return nested.flat();
}

for (const path of await findSourceFiles(sourceRoot)) {
	const sourceText = await readFile(path, "utf8");
	const source = ts.createSourceFile(
		path,
		sourceText,
		ts.ScriptTarget.Latest,
		true,
		path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
	);
	const relativePath = relative(sourceRoot, path).replaceAll("\\", "/");
	const isCatalogFile =
		relativePath.startsWith("i18n/messages/") ||
		relativePath.startsWith("i18n/drafts/");
	const copyConstants = new Map<string, ts.Expression>();
	const recordedNodes = new Set<number>();
	const copyText = (expression: ts.Expression): string | undefined => {
		if (
			ts.isStringLiteral(expression) ||
			ts.isNoSubstitutionTemplateLiteral(expression)
		) {
			return expression.text;
		}
		if (ts.isTemplateExpression(expression)) {
			return [
				expression.head.text,
				...expression.templateSpans.map((span) => span.literal.text),
			].join(" ");
		}
	};

	const record = (node: ts.Node, value: string) => {
		const start = node.getStart(source);
		if (recordedNodes.has(start)) return;
		const message = value.replace(/\s+/g, " ").trim();
		if (!/[A-Za-z]{2}/.test(message)) return;
		if (/^[\w]+(?:\.[\w]+)+$/.test(message)) return;
		if (intentionalSamples.has(`${relativePath}:${message}`)) return;
		recordedNodes.add(start);
		const { line } = source.getLineAndCharacterOfPosition(start);
		untranslated.push(`${relativePath}:${line + 1}: ${message}`);
	};

	const visit = (node: ts.Node) => {
		if (
			!isCatalogFile &&
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression) &&
			node.expression.text === "translate" &&
			node.arguments[0] &&
			(ts.isStringLiteral(node.arguments[0]) ||
				ts.isNoSubstitutionTemplateLiteral(node.arguments[0]))
		) {
			const { line } = source.getLineAndCharacterOfPosition(
				node.arguments[0].getStart(source),
			);
			inlineTranslationKeys.push(
				`${relativePath}:${line + 1}: ${node.arguments[0].text}`,
			);
		}
		if (
			!isCatalogFile &&
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			/(label|title|description|placeholder|tooltip|hint|message|empty|loading|error|success|button|action|copy|text)/i.test(
				node.name.text,
			) &&
			node.initializer &&
			copyText(node.initializer) !== undefined
		) {
			copyConstants.set(node.name.text, node.initializer);
			record(node.initializer, copyText(node.initializer) ?? "");
		}
		if (ts.isJsxText(node)) record(node, node.getText(source));
		if (
			ts.isJsxAttribute(node) &&
			ts.isIdentifier(node.name) &&
			translatableAttributes.has(node.name.text)
		) {
			if (node.initializer && ts.isStringLiteral(node.initializer)) {
				record(node.initializer, node.initializer.text);
			}
			if (
				node.initializer &&
				ts.isJsxExpression(node.initializer) &&
				node.initializer.expression &&
				copyText(node.initializer.expression) !== undefined
			) {
				record(
					node.initializer.expression,
					copyText(node.initializer.expression) ?? "",
				);
			}
		}
		if (
			ts.isJsxExpression(node) &&
			node.expression &&
			(ts.isStringLiteral(node.expression) ||
				ts.isNoSubstitutionTemplateLiteral(node.expression))
		) {
			record(node.expression, node.expression.text);
		}
		if (
			ts.isJsxExpression(node) &&
			node.expression &&
			ts.isTemplateExpression(node.expression) &&
			(!ts.isJsxAttribute(node.parent) ||
				(ts.isIdentifier(node.parent.name) &&
					translatableAttributes.has(node.parent.name.text)))
		) {
			record(node.expression, copyText(node.expression) ?? "");
		}
		if (
			ts.isJsxExpression(node) &&
			node.expression &&
			ts.isIdentifier(node.expression)
		) {
			const initializer = copyConstants.get(node.expression.text);
			const value = initializer && copyText(initializer);
			if (initializer && value !== undefined) record(initializer, value);
		}
		if (
			!isCatalogFile &&
			ts.isPropertyAssignment(node) &&
			ts.isIdentifier(node.name) &&
			translatableProperties.has(node.name.text)
		) {
			const initializer = node.initializer;
			const value = copyText(initializer);
			if (value !== undefined) record(initializer, value);
			if (
				ts.isArrowFunction(initializer) &&
				ts.isExpression(initializer.body)
			) {
				const bodyValue = copyText(initializer.body);
				if (bodyValue !== undefined) record(initializer.body, bodyValue);
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(source);
}

assert.deepEqual(
	untranslated,
	[],
	`Move user-facing JSX and copy-property literals into the English catalog:\n${untranslated.join("\n")}`,
);
assert.deepEqual(
	inlineTranslationKeys,
	[],
	`Use stable references from the Messages object instead of inline catalog paths:\n${inlineTranslationKeys.join("\n")}`,
);

console.log("English catalog coverage checks passed.");
