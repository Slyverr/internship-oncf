import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const styles = readFileSync(
	resolve(process.cwd(), "src/app/globals.css"),
	"utf8",
);

assert.match(styles, /html\s*\{\s*color-scheme:\s*light;/);
assert.match(
	styles,
	/html\.dark,\s*html\[data-theme="dark"\],\s*html\[data-theme="mono-dark"\]\s*\{\s*color-scheme:\s*dark;/s,
);

console.log("Appearance native-control theme checks passed.");
