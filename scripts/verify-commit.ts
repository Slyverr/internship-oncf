import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { delimiter, dirname, isAbsolute, resolve } from "node:path";

const root = process.cwd();
const bun = process.execPath;
const detectedNode = spawnSync("node", ["--version"], { stdio: "ignore" });
const node = process.argv[2] ?? (detectedNode.error ? bun : "node");
const nodeDirectory = isAbsolute(node) ? dirname(node) : undefined;
const nodePath = resolve(root, "apps/api/node_modules");
type Check = {
	label: string;
	command: string;
	args: string[];
	cwd: string;
	env?: NodeJS.ProcessEnv;
};

const checks: Check[] = [
	{
		label: "Format and lint",
		command: node,
		args: [
			resolve(root, "node_modules/@biomejs/biome/bin/biome"),
			"check",
			".",
		],
		cwd: root,
	},
	{
		label: "Workspace typecheck",
		command: bun,
		args: ["run", "typecheck"],
		cwd: root,
	},
	{
		label: "API tests",
		command: bun,
		args: ["run", "test", "--", "--runInBand"],
		cwd: resolve(root, "apps/api"),
	},
	{
		label: "Web tests",
		command: bun,
		args: [resolve(root, "apps/web/test/run.ts")],
		cwd: resolve(root, "apps/web"),
	},
	{
		label: "Shared build",
		command: node,
		args: [
			resolve(root, "node_modules/tsup/dist/cli-default.js"),
			"src/index.ts",
			"--format",
			"cjs,esm",
			"--dts",
			"--clean",
		],
		cwd: resolve(root, "packages/shared"),
	},
	{
		label: "API build",
		command: bun,
		args: ["run", "build"],
		cwd: resolve(root, "apps/api"),
	},
	{
		label: "Web production build",
		command: node,
		args: [
			resolve(root, "node_modules/next/dist/bin/next"),
			"build",
			"--webpack",
		],
		cwd: resolve(root, "apps/web"),
		env: {
			NEXT_BUILD_BUNDLER: "webpack",
			NEXT_BUILD_DIST_DIR: ".next-verify",
		},
	},
];

for (const check of checks) {
	console.log(`\n== ${check.label} ==`);
	const webTsconfigPath = resolve(root, "apps/web/tsconfig.json");
	const originalWebTsconfig =
		check.label === "Web production build"
			? readFileSync(webTsconfigPath, "utf8")
			: undefined;
	const result = spawnSync(check.command, check.args, {
		cwd: check.cwd,
		stdio: "inherit",
		env: {
			...process.env,
			...check.env,
			...(nodeDirectory && {
				PATH: [nodeDirectory, process.env.PATH].filter(Boolean).join(delimiter),
			}),
		},
	});

	if (originalWebTsconfig !== undefined) {
		writeFileSync(webTsconfigPath, originalWebTsconfig);
	}

	if (result.error) {
		console.error(`${check.label} could not start: ${result.error.message}`);
		process.exit(1);
	}

	if (result.status !== 0) {
		console.error(
			`${check.label} failed with exit code ${result.status ?? "unknown"}.`,
		);
		process.exit(result.status ?? 1);
	}
}

console.log("\nAll commit checks passed.");
