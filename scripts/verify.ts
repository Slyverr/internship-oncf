const root = `${import.meta.dir}/..`;
const checks = ["format-and-lint", "typecheck", "test", "build"];

for (const check of checks) {
	console.log(`\n▶ bun run ${check}`);
	const child = Bun.spawn([process.execPath, "run", check], {
		cwd: root,
		env: {
			...process.env,
			...(check === "build" ? { NEXT_BUILD_DIST_DIR: ".next-verify" } : {}),
		},
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit",
	});
	const exitCode = await child.exited;
	if (exitCode !== 0) process.exit(exitCode);
}

console.log(
	"\n✓ Verification passed; build output is isolated in apps/web/.next-verify.",
);
