import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
const spacingUtilities =
	/(?:^|:)(-?(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-(?:\d+(?:\.\d+)?|px|\[[^\]]+\]))/g;
const offGrid: string[] = [];

function isOnFourPixelGrid(pixels: number) {
	return Number.isInteger(pixels / 4);
}

function collectSpacingUtilities(directory: string) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const filePath = join(directory, entry.name);
		if (entry.isDirectory()) {
			collectSpacingUtilities(filePath);
			continue;
		}
		if (!/\.(?:tsx?|css)$/.test(entry.name)) continue;

		const source = readFileSync(filePath, "utf8");
		for (const match of source.matchAll(spacingUtilities)) {
			const utility = match[1]?.split(":").at(-1);
			if (!utility) continue;

			const scale = utility.match(/-(\d+(?:\.\d+)?)$/);
			if (scale) {
				const pixels = Number(scale[1]) * 4;
				if (isOnFourPixelGrid(pixels)) continue;

				// The 2px gap between adjacent claim bubbles is a documented exception.
				if (
					relative(sourceRoot, filePath) ===
						"components/claims/claim-conversation.tsx" &&
					utility === "pt-0.5"
				) {
					continue;
				}
				offGrid.push(
					`${relative(sourceRoot, filePath)}: ${utility} (${pixels}px)`,
				);
				continue;
			}

			const arbitrary = utility.match(/-\[([+-]?[\d.]+)(px|rem)\]$/);
			if (!arbitrary) continue;
			const pixels = Number(arbitrary[1]) * (arbitrary[2] === "rem" ? 16 : 1);
			if (!isOnFourPixelGrid(pixels)) {
				offGrid.push(
					`${relative(sourceRoot, filePath)}: ${utility} (${pixels}px)`,
				);
			}
		}
	}
}

collectSpacingUtilities(sourceRoot);
const globalStyles = readFileSync(join(sourceRoot, "app/globals.css"), "utf8");
assert.match(
	globalStyles,
	/@utility oncf-field\s*\{[^}]*align-content:\s*start;/s,
	"Shared form fields must keep their contents top-aligned inside taller grid rows.",
);
assert.deepEqual(
	offGrid,
	[],
	`Spacing utilities must resolve to multiples of 4px:\n${offGrid.join("\n")}`,
);
console.log("Four-pixel spacing grid check passed.");
