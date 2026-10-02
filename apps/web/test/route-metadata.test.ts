import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import ts from "typescript";

const appRoot = resolve(process.cwd(), "src/app");
const missingMetadata: string[] = [];
const untranslatedMetadata: string[] = [];
const unscopedMetadata: string[] = [];
const unscopedPageCopy: string[] = [];
const unscopedBreadcrumbs: string[] = [];

function hasCatalogMetadata(source: string): boolean {
	return /(?:translate|t)\s*\(\s*Messages\./.test(source);
}

async function findPages(folder: string): Promise<string[]> {
	const entries = await readdir(folder, { withFileTypes: true });
	const nested = await Promise.all(
		entries.map(async (entry) => {
			const path = resolve(folder, entry.name);
			if (entry.isDirectory()) return findPages(path);
			return entry.name === "page.tsx" ? [path] : [];
		}),
	);
	return nested.flat();
}

async function exists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

for (const pagePath of await findPages(appRoot)) {
	const pageText = await readFile(pagePath, "utf8");
	const route = relative(appRoot, pagePath).replaceAll("\\", "/");
	if (route === "page.tsx" && pageText.includes("redirect(")) continue;
	if (
		/Messages\./.test(pageText) &&
		!(pageText.startsWith('"use client"')
			? pageText.includes("useTranslate")
			: pageText.includes("getRequestTranslator"))
	) {
		unscopedPageCopy.push(route);
	}
	const sourceFile = ts.createSourceFile(
		pagePath,
		pageText,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);
	function checkBreadcrumbTranslator(node: ts.Node) {
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			/(orders|claims|customers|users|programs)Breadcrumbs/.test(
				node.expression.expression.getText(sourceFile),
			) &&
			["home", "create", "detail", "edit"].includes(
				node.expression.name.text,
			) &&
			node.arguments.at(-1)?.getText(sourceFile) !== "t"
		) {
			unscopedBreadcrumbs.push(route);
		}
		ts.forEachChild(node, checkBreadcrumbTranslator);
	}
	checkBreadcrumbTranslator(sourceFile);

	const hasPageMetadata =
		/export\s+(?:const\s+metadata|async\s+function\s+generateMetadata)/.test(
			pageText,
		);
	let hasScopedLayoutMetadata = false;
	let parent = dirname(pagePath);
	while (parent !== appRoot) {
		const layoutPath = resolve(parent, "layout.tsx");
		if (await exists(layoutPath)) {
			const layoutText = await readFile(layoutPath, "utf8");
			if (
				/export\s+(?:const\s+metadata|async\s+function\s+generateMetadata)/.test(
					layoutText,
				)
			) {
				hasScopedLayoutMetadata = true;
				if (!hasCatalogMetadata(layoutText)) {
					untranslatedMetadata.push(
						relative(appRoot, layoutPath).replaceAll("\\", "/"),
					);
				}
				break;
			}
		}
		parent = dirname(parent);
	}

	if (!hasPageMetadata && !hasScopedLayoutMetadata) missingMetadata.push(route);
	if (hasPageMetadata && !hasCatalogMetadata(pageText)) {
		untranslatedMetadata.push(route);
	}
	if (/export\s+async\s+function\s+generateMetadata/.test(pageText)) {
		const metadataBlock = pageText.match(
			/export\s+async\s+function\s+generateMetadata[\s\S]*?^\s*}\s*$/m,
		)?.[0];
		if (
			!metadataBlock?.includes("getRequestTranslator()") ||
			!hasCatalogMetadata(metadataBlock)
		) {
			unscopedMetadata.push(route);
		}
	}
}

assert.deepEqual(
	missingMetadata,
	[],
	`Add localized page metadata or a route-scoped metadata layout:\n${missingMetadata.join("\n")}`,
);
assert.deepEqual(
	untranslatedMetadata,
	[],
	`Use the English catalog for route metadata:\n${untranslatedMetadata.join("\n")}`,
);
assert.deepEqual(
	unscopedMetadata,
	[],
	`Resolve route metadata through the request translator:\n${unscopedMetadata.join("\n")}`,
);
assert.deepEqual(
	unscopedPageCopy,
	[],
	`Resolve server route copy through the request translator:\n${unscopedPageCopy.join("\n")}`,
);
assert.deepEqual(
	unscopedBreadcrumbs,
	[],
	`Pass the request translator to entity breadcrumbs:\n${unscopedBreadcrumbs.join("\n")}`,
);

console.log("Localized route metadata checks passed.");
