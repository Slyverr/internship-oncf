import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	workers: 1,
	timeout: 30_000,
	expect: { timeout: 5_000 },
	reporter: "list",
	use: {
		baseURL: "http://localhost:3100",
		browserName: "chromium",
		viewport: { width: 1440, height: 900 },
		trace: "retain-on-failure",
	},
});
