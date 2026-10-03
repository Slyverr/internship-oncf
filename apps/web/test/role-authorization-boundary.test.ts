import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../../..",
);
const roleReferences = new Set<string>();
const roleReferencePattern =
	/\bRole\.(ADMIN|AGENT_COMMERCIAL|CLIENT_REPRESENTATIVE)\b/;

function collectSourceFiles(directory: string) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			collectSourceFiles(path);
			continue;
		}
		if (!/\.tsx?$/.test(entry.name) || entry.name.endsWith(".spec.ts")) {
			continue;
		}

		const source = readFileSync(path, "utf8");
		if (roleReferencePattern.test(source)) {
			roleReferences.add(relative(repositoryRoot, path).replaceAll("\\", "/"));
		}
	}
}

for (const sourceRoot of ["apps/api/src", "apps/web/src"]) {
	collectSourceFiles(resolve(repositoryRoot, sourceRoot));
}

// These uses provision/display personas or identify a registration workflow;
// API and UI capability checks must use effective permissions instead.
assert.deepEqual(
	[...roleReferences].sort(),
	[
		"apps/api/src/database/reference-data/constants/auth.const.ts",
		"apps/api/src/database/reference-data/reference-data.seeder.ts",
		"apps/api/src/users/users.mapper.ts",
		"apps/web/src/components/users/user-actions.tsx",
		"apps/web/src/lib/action-visibility.ts",
		"apps/web/src/lib/user-labels.ts",
	].sort(),
	"role constants may only provision or describe personas; authorization must check permissions",
);
