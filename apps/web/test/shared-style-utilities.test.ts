import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
const globalStylesPath = join(sourceRoot, "app/globals.css");
const globalStyles = readFileSync(globalStylesPath, "utf8");
const definedUtilities = new Set(
	[...globalStyles.matchAll(/@utility\s+(oncf-[A-Za-z0-9_-]+)/g)].map(
		(match) => match[1],
	),
);
const usedUtilities = new Map<string, Set<string>>();

function collectUtilities(directory: string) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const filePath = join(directory, entry.name);
		if (entry.isDirectory()) {
			collectUtilities(filePath);
			continue;
		}
		if (!/\.(?:tsx?|css)$/.test(entry.name)) continue;

		const source = readFileSync(filePath, "utf8");
		for (const match of source.matchAll(/(?<!-)\boncf-[A-Za-z0-9_-]+\b/g)) {
			const utility = match[0];
			if (definedUtilities.has(utility)) continue;
			const files = usedUtilities.get(utility) ?? new Set<string>();
			files.add(relative(sourceRoot, filePath));
			usedUtilities.set(utility, files);
		}
	}
}

collectUtilities(sourceRoot);

assert.deepEqual(
	[...usedUtilities.entries()].map(([utility, files]) => [
		utility,
		[...files].sort(),
	]),
	[],
	"Every oncf-* class must be declared as a shared @utility in globals.css",
);

console.log("Shared component style utility checks passed.");
