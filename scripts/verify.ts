import { resolve } from "node:path";

const root = resolve(import.meta.dir, "..");

async function run(
	label: string,
	command: string[],
	env: Record<string, string | undefined> = process.env,
) {
	console.log(`\n▶ ${label}`);

	const child = Bun.spawn(command, {
		cwd: root,
		env,
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit",
	});

	const exitCode = await child.exited;
	if (exitCode !== 0) process.exit(exitCode);
}

await run("Formatting and linting", [
	process.execPath,
	"run",
	"format-and-lint",
]);

await run(
	"Typechecks, tests, and production builds",
	[process.execPath, "x", "turbo", "run", "typecheck", "test", "build"],
	{
		...process.env,
		NEXT_BUILD_DIST_DIR: ".next-verify",
	},
);

console.log(
	"\n✓ Verification passed; build output is isolated in apps/web/.next-verify.",
);
