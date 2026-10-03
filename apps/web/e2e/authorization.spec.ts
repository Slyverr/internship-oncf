import { test } from "@playwright/test";
import {
	verifyAdminAppearanceSettings,
	verifyAdminCatalogLifecycle,
	verifyAdminCustomRoleAssignment,
	verifyAdminDashboard,
	verifyAdminDashboardApiRecovery,
	verifyAdminNavigation,
	verifyAdminRegistrationReview,
	verifyAdminReportCsvExport,
	verifyAdminReportPrintLayout,
	verifyAgentDashboard,
	verifyAgentNavigation,
	verifyAgentOperationalCreation,
	verifyClientAuthorization,
	verifyClientDashboard,
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

test("admin appearance controls preview and sync visual preferences", async ({
	page,
}) => {
	await verifyAdminAppearanceSettings(page);
});

test("admin dashboard requests only report and user data", async ({ page }) => {
	await verifyAdminDashboard(page);
});

test("admin dashboard recovers when the API becomes available", async ({
	page,
}) => {
	await verifyAdminDashboardApiRecovery(page);
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

test("agent dashboard shows operational insights without user administration", async ({
	page,
}) => {
	await verifyAgentDashboard(page);
});

test("agent can create a scoped claim and an eligible-order program", async ({
	page,
}) => {
	await verifyAgentOperationalCreation(page);
});

test("client can submit an order and print its details to PDF", async ({
	page,
}) => {
	await verifyClientOrderSubmission(page);
});

test("client sees own operational routes while user administration stays denied", async ({
	page,
}) => {
	await verifyClientAuthorization(page);
});

test("client dashboard shows scoped records without admin or program-creation data", async ({
	page,
}) => {
	await verifyClientDashboard(page);
});

test("admin report print view generates a readable themed PDF", async ({
	page,
}) => {
	await verifyAdminReportPrintLayout(page);
});

test("admin can download an order report as CSV", async ({ page }) => {
	await verifyAdminReportCsvExport(page);
});
