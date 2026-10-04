import { rm } from "node:fs/promises";
import { delimiter, resolve } from "node:path";

const rootDir = resolve(import.meta.dir, "..");
const apiDir = resolve(rootDir, "apps/api");
const webDir = resolve(rootDir, "apps/web");
const jestExecutable = resolve(rootDir, "node_modules/jest/bin/jest.js");
const composeFile = resolve(rootDir, "docker-compose.e2e.yml");
const postgresPort = Number(process.env.ECOMMAND_E2E_POSTGRES_PORT ?? "55432");
const browserOnly = process.argv.includes("--browser-only");

const e2eEnv = {
	...process.env,
	PATH: [
		resolve(rootDir, "node_modules/.bin"),
		resolve(apiDir, "node_modules/.bin"),
		process.env.PATH ?? "",
	]
		.filter(Boolean)
		.join(delimiter),
	DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${postgresPort}/ecommand_e2e`,
	JWT_SECRET: "ecommand-e2e-test-secret-not-for-production",
	JWT_EXPIRES_IN: "30m",
	AUTH_LOGIN_MAX_ATTEMPTS: "3",
	AUTH_LOGIN_LOCK_DURATION_SECONDS: "60",
	WEB_APP_URL: "http://localhost:3000",
};

async function run(
	command: string[],
	options: {
		cwd?: string;
		env?: Record<string, string | undefined>;
		quiet?: boolean;
	} = {},
) {
	const child = Bun.spawn(command, {
		cwd: options.cwd ?? rootDir,
		env: options.env ?? e2eEnv,
		stdin: "inherit",
		stdout: options.quiet ? "ignore" : "inherit",
		stderr: options.quiet ? "ignore" : "inherit",
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

const nodeExecutable = process.env.ECOMMAND_E2E_NODE ?? Bun.which("node");
const tsxExecutable = resolve(rootDir, "node_modules/tsx/dist/cli.mjs");
const drizzleKitExecutable = resolve(
	rootDir,
	"node_modules/drizzle-kit/bin.cjs",
);

if (!nodeExecutable) {
	throw new Error(
		"Node.js is required to run Jest E2E tests. Put node on PATH or set ECOMMAND_E2E_NODE to its executable path.",
	);
}

if (
	await commandWorks([
		nodeExecutable,
		"-e",
		"process.exit(process.versions.bun ? 0 : 1)",
	])
) {
	throw new Error(
		"A real Node.js runtime is required for Jest E2E tests; the detected executable is Bun's Node.js compatibility shim. Set ECOMMAND_E2E_NODE to a Node.js binary.",
	);
}

const compose = await findComposeCommand();
const composeArgs = [...compose, "-f", composeFile, "-p", "ecommand-e2e"];

async function waitForServer(
	url: string,
	name: string,
	process: Bun.Subprocess,
) {
	for (let attempt = 0; attempt < 90; attempt += 1) {
		if (process.exitCode !== null) {
			throw new Error(
				`${name} exited before becoming ready (${process.exitCode})`,
			);
		}
		try {
			const response = await fetch(url);
			if (response.ok) return;
		} catch {
			// The listener may need a few seconds after its process starts.
		}
		await Bun.sleep(1000);
	}
	throw new Error(`${name} did not become ready at ${url}`);
}

async function stopServer(process: Bun.Subprocess) {
	if (process.exitCode !== null) return;
	process.kill("SIGTERM");
	await Promise.race([process.exited, Bun.sleep(5000)]);
	if (process.exitCode === null) process.kill("SIGKILL");
	await process.exited;
}

async function runBrowserWorkflows() {
	const buildDir = ".next-e2e";
	const browserEnv = {
		...e2eEnv,
		NESTJS_PORT: "8100",
		WEB_APP_URL: "http://localhost:3100",
		BACKEND_API_URL: "http://localhost:8100",
		NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
		NEXT_BUILD_DIST_DIR: buildDir,
		PORT: "3100",
		LOCAL_MAILBOX_PATH: "/tmp/ecommand-e2e-mailbox",
		STORAGE_PATH: "/tmp/ecommand-e2e-storage",
	};
	const api = Bun.spawn(["bun", "run", "start"], {
		cwd: apiDir,
		env: browserEnv,
		stdin: "ignore",
		stdout: "ignore",
		stderr: "inherit",
	});
	let web: Bun.Subprocess | undefined;
	try {
		await rm(resolve(webDir, buildDir), { recursive: true, force: true });
		await waitForServer("http://localhost:8100/health", "E2E API", api);
		web = Bun.spawn(
			[
				nodeExecutable,
				resolve(rootDir, "node_modules/next/dist/bin/next"),
				"dev",
				"--port",
				"3100",
			],
			{
				cwd: webDir,
				env: browserEnv,
				stdin: "ignore",
				stdout: "ignore",
				stderr: "inherit",
			},
		);
		await waitForServer("http://localhost:3100/login", "E2E web app", web);
		if (browserEnv.PLAYWRIGHT_CDP_ENDPOINT) {
			await run(
				[nodeExecutable, tsxExecutable, resolve(webDir, "e2e/run-cdp.ts")],
				{ cwd: webDir, env: browserEnv },
			);
		} else {
			await run(
				[nodeExecutable, "../../node_modules/playwright/cli.js", "test"],
				{
					cwd: webDir,
					env: browserEnv,
				},
			);
		}
	} finally {
		if (web) await stopServer(web);
		await stopServer(api);
		await rm(resolve(webDir, buildDir), { recursive: true, force: true });
	}
}

let executionError: unknown;

try {
	await run([...composeArgs, "down", "--volumes", "--remove-orphans"], {
		env: process.env,
		quiet: true,
	});
	await run([...composeArgs, "up", "-d", "postgres-e2e"]);
	await run(
		[nodeExecutable, tsxExecutable, "./test/helpers/wait-for-e2e-services.ts"],
		{ cwd: apiDir },
	);

	await run([nodeExecutable, drizzleKitExecutable, "push", "--force"], {
		cwd: apiDir,
	});
	await run([nodeExecutable, tsxExecutable, "./drizzle/seed/seed-ref.ts"], {
		cwd: apiDir,
	});
	await run([nodeExecutable, tsxExecutable, "./test/fixtures/seed-e2e.ts"], {
		cwd: apiDir,
	});
	if (!browserOnly) {
		await run(
			[
				nodeExecutable,
				jestExecutable,
				"--config",
				"./test/jest-e2e.json",
				"--runInBand",
			],
			{ cwd: apiDir },
		);
	}
	if (process.argv.includes("--browser")) {
		await run(
			[nodeExecutable, tsxExecutable, "./test/helpers/reset-e2e-database.ts"],
			{
				cwd: apiDir,
			},
		);
		await run([nodeExecutable, drizzleKitExecutable, "push", "--force"], {
			cwd: apiDir,
		});
		await run([nodeExecutable, tsxExecutable, "./drizzle/seed/seed-ref.ts"], {
			cwd: apiDir,
		});
		await run([nodeExecutable, tsxExecutable, "./test/fixtures/seed-e2e.ts"], {
			cwd: apiDir,
		});
		await runBrowserWorkflows();
	}
} catch (error) {
	executionError = error;
} finally {
	try {
		await run([...composeArgs, "down", "--volumes", "--remove-orphans"], {
			env: process.env,
			quiet: true,
		});
	} catch (cleanupError) {
		if (executionError) {
			console.error("Failed to tear down E2E services:", cleanupError);
		} else {
			executionError = cleanupError;
		}
	}
}

if (executionError) throw executionError;
