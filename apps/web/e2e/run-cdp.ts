import type { BrowserContext, Page } from "@playwright/test";
import { chromium } from "@playwright/test";
import {
	verifyAdminCatalogLifecycle,
	verifyAdminCustomRoleAssignment,
	verifyAdminNavigation,
	verifyAdminRegistrationReview,
	verifyAgentNavigation,
	verifyAgentOperationalCreation,
	verifyClientAuthorization,
	verifyClientOrderSubmission,
} from "./authorization-flows";

const endpoint = process.env.PLAYWRIGHT_CDP_ENDPOINT;

const workflows: [string, (page: Page) => Promise<void>][] = [
	["admin navigation and access", verifyAdminNavigation],
	["admin registration review", verifyAdminRegistrationReview],
	[
		"admin custom role assignment and authorization",
		verifyAdminCustomRoleAssignment,
	],
	["admin reference-data lifecycle", verifyAdminCatalogLifecycle],
	["agent navigation and claim creation access", verifyAgentNavigation],
	["agent scoped claim and program creation", verifyAgentOperationalCreation],
	["client order submission", verifyClientOrderSubmission],
	["client navigation and API denial", verifyClientAuthorization],
];

async function main() {
	if (!endpoint) throw new Error("PLAYWRIGHT_CDP_ENDPOINT is required");
	const browser = await chromium.connectOverCDP(endpoint);
	try {
		for (const [name, verify] of workflows) {
			let context: BrowserContext | undefined;
			try {
				context = await browser.newContext({
					baseURL: "http://localhost:3100",
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
