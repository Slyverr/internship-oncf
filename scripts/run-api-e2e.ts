import { resolve } from "node:path";

const rootDir = resolve(import.meta.dir, "..");
const apiDir = resolve(rootDir, "apps/api");
const composeFile = resolve(rootDir, "docker-compose.e2e.yml");
const postgresPort = Number(process.env.ECOMMAND_E2E_POSTGRES_PORT ?? "55432");

const e2eEnv = {
	...process.env,
	DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${postgresPort}/ecommand_e2e`,
	JWT_SECRET: "ecommand-e2e-test-secret-not-for-production",
	JWT_EXPIRES_IN: "30m",
	WEB_APP_URL: "http://localhost:3000",
};

async function run(
	command: string[],
	options: { cwd?: string; env?: Record<string, string | undefined> } = {},
) {
	const child = Bun.spawn(command, {
		cwd: options.cwd ?? rootDir,
		env: options.env ?? e2eEnv,
		stdin: "inherit",
		stdout: "inherit",
		stderr: "inherit",
	});
	const exitCode = await child.exited;
	if (exitCode !== 0) {
		throw new Error(`Command failed (${exitCode}): ${command.join(" ")}`);
	}
}

async function commandWorks(command: string[]) {
	const child = Bun.spawn(command, {
		cwd: rootDir,
		stdout: "ignore",
		stderr: "ignore",
	});
	return (await child.exited) === 0;
}

async function findComposeCommand() {
	if (
		Bun.which("docker") &&
		(await commandWorks(["docker", "compose", "version"]))
	) {
		return ["docker", "compose"];
	}
	if (
		Bun.which("podman") &&
		(await commandWorks(["podman", "compose", "version"]))
	) {
		return ["podman", "compose"];
	}
	throw new Error(
		"Docker Compose or Podman Compose is required to run API E2E tests",
	);
}

const compose = await findComposeCommand();
const composeArgs = [...compose, "-f", composeFile, "-p", "ecommand-e2e"];

try {
	await run([...composeArgs, "down", "--volumes", "--remove-orphans"]);
	await run([...composeArgs, "up", "-d", "postgres-e2e"]);
	await run(["bun", "run", "wait:e2e-services"], { cwd: apiDir });

	await run(["bun", "run", "drizzle-kit", "push", "--force"], {
		cwd: apiDir,
	});
	await run(["bun", "run", "seed:ref"], { cwd: apiDir });
	await run(["bun", "run", "seed:e2e"], { cwd: apiDir });
	await run(["bun", "run", "test:e2e:jest"], { cwd: apiDir });
} finally {
	await run([...composeArgs, "down", "--volumes", "--remove-orphans"], {
		env: process.env,
	}).catch((error) => {
		console.error("Failed to tear down E2E services:", error);
	});
}
