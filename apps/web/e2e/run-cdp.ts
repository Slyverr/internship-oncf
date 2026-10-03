import type { BrowserContext, Page } from "@playwright/test";
import { chromium } from "@playwright/test";
import {
	verifyAdminCatalogLifecycle,
	verifyAdminCustomRoleAssignment,
	verifyAdminDashboard,
	verifyAdminDashboardApiRecovery,
	verifyAdminNavigation,
	verifyAdminRegistrationReview,
	verifyAdminReportCsvExport,
	verifyAgentDashboard,
	verifyAgentNavigation,
	verifyAgentOperationalCreation,
	verifyClientAuthorization,
	verifyClientDashboard,
	verifyClientOrderSubmission,
} from "./authorization-flows";

const endpoint = process.env.PLAYWRIGHT_CDP_ENDPOINT;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

const workflows: [string, (page: Page) => Promise<void>][] = [
	["admin navigation and access", verifyAdminNavigation],
	["admin dashboard visibility follows permissions", verifyAdminDashboard],
	[
		"admin dashboard recovers when the API becomes available",
		verifyAdminDashboardApiRecovery,
	],
	["admin report CSV download", verifyAdminReportCsvExport],
	["admin registration review", verifyAdminRegistrationReview],
	[
		"admin custom role assignment and authorization",
		verifyAdminCustomRoleAssignment,
	],
	["admin reference-data lifecycle", verifyAdminCatalogLifecycle],
	["agent navigation and claim creation access", verifyAgentNavigation],
	["agent dashboard shows scoped operational insights", verifyAgentDashboard],
	["agent scoped claim and program creation", verifyAgentOperationalCreation],
	["client order submission", verifyClientOrderSubmission],
	[
		"client dashboard hides management and program-creation actions",
		verifyClientDashboard,
	],
	["client navigation and API denial", verifyClientAuthorization],
];
const requestedWorkflows = new Set(
	(process.env.E2E_BROWSER_WORKFLOWS ?? "")
		.split(",")
		.map((name) => name.trim())
		.filter(Boolean),
);
const workflowsToRun = requestedWorkflows.size
	? workflows.filter(([name]) => requestedWorkflows.has(name))
	: workflows;

if (
	workflowsToRun.length !== requestedWorkflows.size &&
	requestedWorkflows.size
) {
	const unmatched = [...requestedWorkflows].filter(
		(name) => !workflows.some(([workflowName]) => workflowName === name),
	);
	throw new Error(`Unknown browser workflows: ${unmatched.join(", ")}`);
}

async function main() {
	if (!endpoint) throw new Error("PLAYWRIGHT_CDP_ENDPOINT is required");
	const browser = await chromium.connectOverCDP(endpoint);
	try {
		for (const [name, verify] of workflowsToRun) {
			let context: BrowserContext | undefined;
			try {
				context = await browser.newContext({
					baseURL,
					viewport: { width: 1440, height: 900 },
				});
				const page = await context.newPage();
				await verify(page);
				console.log(`PASS browser workflow: ${name}`);
			} finally {
				await context?.close();
			}
		}
	} finally {
		await browser.close();
	}
}

void main();
