import { test } from "@playwright/test";
import {
	verifyAdminCatalogLifecycle,
	verifyAdminCustomRoleAssignment,
	verifyAdminNavigation,
	verifyAdminRegistrationReview,
	verifyAdminReportPrintLayout,
	verifyAgentNavigation,
	verifyAgentOperationalCreation,
	verifyClientAuthorization,
	verifyClientOrderSubmission,
} from "./authorization-flows";

test("admin can review a customer registration after signup", async ({
	page,
}) => {
	await verifyAdminRegistrationReview(page);
});

test("admin sees account/access/report navigation, not operational records", async ({
	page,
}) => {
	await verifyAdminNavigation(page);
});

test("admin can assign a custom permission profile and it controls access", async ({
	page,
}) => {
	await verifyAdminCustomRoleAssignment(page);
});

test("admin can create, rename, archive, and restore reference data", async ({
	page,
}) => {
	await verifyAdminCatalogLifecycle(page);
});

test("commercial agent sees operational routes but not user administration", async ({
	page,
}) => {
	await verifyAgentNavigation(page);
});

test("agent can create a scoped claim and an eligible-order program", async ({
	page,
}) => {
	await verifyAgentOperationalCreation(page);
});

test("client can submit an order through the guided form", async ({ page }) => {
	await verifyClientOrderSubmission(page);
});

test("client sees own operational routes while user administration stays denied", async ({
	page,
}) => {
	await verifyClientAuthorization(page);
});

test("admin report print view generates a readable themed PDF", async ({
	page,
}) => {
	await verifyAdminReportPrintLayout(page);
});
