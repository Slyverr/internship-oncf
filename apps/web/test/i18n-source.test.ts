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

function getConditionalRenderCopy(node: ts.Expression): string[] {
	if (ts.isParenthesizedExpression(node)) {
		return getConditionalRenderCopy(node.expression);
	}
	if (ts.isConditionalExpression(node)) {
		return [node.whenTrue, node.whenFalse].flatMap(getConditionalRenderCopy);
	}
	if (
		ts.isBinaryExpression(node) &&
		(node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
			node.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
			node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
	) {
		return getConditionalRenderCopy(node.right);
	}
	const copy = getCopyText(node);
	return copy === undefined ? [] : [copy];
}

function isUserFacingMessageCall(node: ts.CallExpression) {
	const target = node.expression;
	if (ts.isIdentifier(target)) {
		return /^(?:alert|confirm|prompt|notify|showToast|addToast|setError|setSuccess|setNotice|setMessage|setToast|setFeedback)$/i.test(
			target.text,
		);
	}
	if (!ts.isPropertyAccessExpression(target)) {
		return false;
	}
	const receiver = target.expression;
	const method = target.name.text;
	return (
		((ts.isIdentifier(receiver) && receiver.text === "toast") ||
			(ts.isIdentifier(receiver) && receiver.text === "window")) &&
		[
			"success",
			"error",
			"warning",
			"info",
			"alert",
			"confirm",
			"prompt",
		].includes(method)
	);
}

function getRawCopyArguments(node: ts.Expression): string[] {
	const copy = getCopyText(node);
	if (copy !== undefined) {
		return [copy];
	}
	const copies: string[] = [];
	ts.forEachChild(node, (child) => {
		if (ts.isExpression(child)) copies.push(...getRawCopyArguments(child));
	});
	return copies;
}

function getUserFacingCallCopy(node: ts.Node): string[] {
	if (!ts.isCallExpression(node) || !isUserFacingMessageCall(node)) {
		return [];
	}
	const firstArgument = node.arguments[0];
	return firstArgument ? getRawCopyArguments(firstArgument) : [];
}

const helperCallFixture = ts.createSourceFile(
	"helper-call-copy.ts",
	`toast.success("Saved");
setError(isOffline ? "Check the connection" : "Try again");
setMessage(customer.name);
setError(translate(Messages.common.saved));
logger.error("developer diagnostic");`,
	ts.ScriptTarget.Latest,
	true,
);
const helperCallCopies: string[] = [];
function findHelperCallCopies(node: ts.Node) {
	helperCallCopies.push(...getUserFacingCallCopy(node));
	ts.forEachChild(node, findHelperCallCopies);
}
findHelperCallCopies(helperCallFixture);
assert.deepEqual(helperCallCopies, [
	"Saved",
	"Check the connection",
	"Try again",
]);

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

const conditionalJsxFixture = ts.createSourceFile(
	"conditional-jsx-copy.tsx",
	'function Example({ active, label }) { return <><span>{active ? "Enabled" : "Disabled"}</span><span>{label ?? "Missing label"}</span><span>{active && "Ready"}</span></>; }',
	ts.ScriptTarget.Latest,
	true,
	ts.ScriptKind.TSX,
);
const conditionalJsxCopies: string[] = [];
function findConditionalJsxCopies(node: ts.Node) {
	if (
		ts.isJsxExpression(node) &&
		node.expression &&
		node.parent &&
		(ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
	) {
		conditionalJsxCopies.push(...getConditionalRenderCopy(node.expression));
	}
	ts.forEachChild(node, findConditionalJsxCopies);
}
findConditionalJsxCopies(conditionalJsxFixture);
assert.deepEqual(conditionalJsxCopies, [
	"Enabled",
	"Disabled",
	"Missing label",
	"Ready",
]);

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

const localeSensitiveFormatters = new Set([
	"formatDisplayDate",
	"formatMediumDate",
	"formatDisplayDateTime",
	"formatMessageTime",
	"formatFullMessageTime",
	"formatMonthDay",
	"formatMonthLabel",
	"formatMonthYear",
	"formatRelativeTime",
	"formatFileSize",
	"formatNumber",
	"formatUserRole",
	"formatUserType",
	"formatRegistrationStatus",
	"getClaimTypeLabel",
	"getClaimPriorityLabel",
	"getClaimStatusLabel",
	"getOrderStatusLabel",
	"getProgramStatusLabel",
]);

function getCopyNamedBindingDefault(
	node: ts.Node,
): { name: string; text: string } | undefined {
	if (
		!ts.isBindingElement(node) ||
		!ts.isIdentifier(node.name) ||
		!copyVariableName.test(node.name.text) ||
		!node.initializer
	) {
		return undefined;
	}
	const text =
		getCopyText(node.initializer) ??
		getConditionalRenderCopy(node.initializer).find((copy) =>
			/[A-Za-z]{2}/.test(copy),
		);
	return text ? { name: node.name.text, text } : undefined;
}

const parameterDefaultFixture = ts.createSourceFile(
	"parameter-default-copy.ts",
	'function render({ title = "Open record", description = show ? "Edit record" : "Create record" }) {}',
	ts.ScriptTarget.Latest,
	true,
);
let parameterDefaultFixtureCopy: ReturnType<typeof getCopyNamedBindingDefault>;
function findParameterDefaultCopy(node: ts.Node) {
	parameterDefaultFixtureCopy ??= getCopyNamedBindingDefault(node);
	ts.forEachChild(node, findParameterDefaultCopy);
}
findParameterDefaultCopy(parameterDefaultFixture);
assert.deepEqual(parameterDefaultFixtureCopy, {
	name: "title",
	text: "Open record",
});
let conditionalParameterDefaultFixtureCopy:
	| ReturnType<typeof getCopyNamedBindingDefault>
	| undefined;
function findConditionalParameterDefaultCopy(node: ts.Node) {
	const copy = getCopyNamedBindingDefault(node);
	if (copy?.name === "description")
		conditionalParameterDefaultFixtureCopy = copy;
	ts.forEachChild(node, findConditionalParameterDefaultCopy);
}
findConditionalParameterDefaultCopy(parameterDefaultFixture);
assert.deepEqual(conditionalParameterDefaultFixtureCopy, {
	name: "description",
	text: "Edit record",
});

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
		if (
			file.includes("/components/") &&
			ts.isCallExpression(node) &&
			ts.isIdentifier(node.expression)
		) {
			const functionName = node.expression.text;
			const hasExplicitLocale = node.arguments.some(
				(argument) => ts.isIdentifier(argument) && argument.text === "locale",
			);
			if (functionName === "translate" && node.arguments.length < 3) {
				const line =
					sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
						.line + 1;
				violations.push(
					`${file}:${line}: component translations must use the active locale translator or pass an explicit locale`,
				);
			}
			if (localeSensitiveFormatters.has(functionName) && !hasExplicitLocale) {
				const line =
					sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
						.line + 1;
				violations.push(
					`${file}:${line}: ${functionName} must receive the active locale`,
				);
			}
		}
		const helperCallCopy = getUserFacingCallCopy(node).find((copy) =>
			/[A-Za-z]{2}/.test(copy),
		);
		if (helperCallCopy) {
			const line =
				sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
					.line + 1;
			violations.push(
				`${file}:${line}: user-facing helper copy must use the message catalog: ${JSON.stringify(helperCallCopy)}`,
			);
		}
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
			ts.isJsxExpression(node) &&
			node.expression &&
			node.parent &&
			(ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
		) {
			for (const copy of getConditionalRenderCopy(node.expression).filter(
				(value) => /[A-Za-z]{2}/.test(value),
			)) {
				const line =
					sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
						.line + 1;
				violations.push(
					`${file}:${line}: conditional JSX copy must use the message catalog: ${JSON.stringify(copy)}`,
				);
			}
		}
		if (
			ts.isJsxAttribute(node) &&
			userFacingAttributes.has(node.name.getText(sourceFile)) &&
			node.initializer
		) {
			const expression = ts.isJsxExpression(node.initializer)
				? node.initializer.expression
				: undefined;
			const values = [
				ts.isStringLiteral(node.initializer)
					? node.initializer.text
					: expression
						? getCopyText(expression)
						: undefined,
				...(expression ? getConditionalRenderCopy(expression) : []),
			].filter((value): value is string => Boolean(value));
			for (const value of values.filter((candidate) =>
				/[A-Za-z]{2}/.test(candidate),
			)) {
				const line =
					sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
						.line + 1;
				violations.push(
					`${file}:${line}: ${node.name.getText(sourceFile)} must use the message catalog: ${JSON.stringify(value)}`,
				);
			}
		}
		const propertyCopies = ts.isPropertyAssignment(node)
			? [
					getCopyText(node.initializer),
					...getConditionalRenderCopy(node.initializer),
				].filter((value): value is string => Boolean(value))
			: [];
		if (
			ts.isPropertyAssignment(node) &&
			userFacingProperties.has(
				node.name.getText(sourceFile).replaceAll('"', ""),
			)
		) {
			for (const propertyCopy of propertyCopies.filter((value) =>
				/[A-Za-z]{2}/.test(value),
			)) {
				const line =
					sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
						.line + 1;
				violations.push(
					`${file}:${line}: ${node.name.getText(sourceFile)} copy must use the message catalog: ${JSON.stringify(propertyCopy)}`,
				);
			}
		}
		const variableCopies =
			ts.isVariableDeclaration(node) && node.initializer
				? [
						getCopyText(node.initializer),
						...getConditionalRenderCopy(node.initializer),
					].filter((value): value is string => Boolean(value))
				: [];
		const parameterDefaultCopy = getCopyNamedBindingDefault(node);
		if (
			ts.isVariableDeclaration(node) &&
			copyVariableName.test(node.name.getText(sourceFile))
		) {
			for (const variableCopy of variableCopies.filter((value) =>
				/[A-Za-z]{2}/.test(value),
			)) {
				const line =
					sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
						.line + 1;
				violations.push(
					`${file}:${line}: ${node.name.getText(sourceFile)} copy must use the message catalog: ${JSON.stringify(variableCopy)}`,
				);
			}
		}
		if (parameterDefaultCopy && /[A-Za-z]{2}/.test(parameterDefaultCopy.text)) {
			const line =
				sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
					.line + 1;
			violations.push(
				`${file}:${line}: ${parameterDefaultCopy.name} default copy must use the message catalog: ${JSON.stringify(parameterDefaultCopy.text)}`,
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
