import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { API_ERROR_CODES, API_TRANSPORT_ERROR_CODES } from "@ecommand/shared";
import { expect, type Page } from "@playwright/test";
import {
	E2E_CUSTOMER_ICE,
	E2E_CUSTOMERS,
	E2E_ORDERS,
	E2E_PASSWORD,
	E2E_USERS,
} from "../../api/test/fixtures/e2e-fixtures";
import { sidebarRoutes } from "../src/components/sidebar/sidebar-routes";
import { Messages, translate } from "../src/i18n";

const navigation = {
	claims: translate(Messages.navigation.claims),
	catalog: translate(Messages.navigation.referenceData),
	customers: translate(Messages.navigation.customers),
	orders: translate(Messages.navigation.orders),
	programs: translate(Messages.navigation.programs),
	reports: translate(Messages.navigation.reports),
	roles: translate(Messages.navigation.roleProfiles),
	users: translate(Messages.navigation.users),
};

async function signIn(page: Page, username: string) {
	await page.goto("/login", { waitUntil: "domcontentloaded" });
	await page.getByLabel(translate(Messages.auth.login.username)).fill(username);
	await page.locator("#password").fill(E2E_PASSWORD);
	await page
		.getByRole("button", { name: translate(Messages.auth.login.title) })
		.click();
	await expect(page).toHaveURL(/\/dashboard$/);
}

async function expectRouteVisible(page: Page, label: string, visible: boolean) {
	const routeDefinition = sidebarRoutes.find(
		(route) => translate(route.titleKey) === label,
	);
	if (!routeDefinition) throw new Error(`Unknown navigation route: ${label}`);
	const route = page.locator(
		`[data-sidebar="menu-button"][href="${routeDefinition.url}"], nav[aria-label^="Main navigation"] a[href="${routeDefinition.url}"]`,
	);
	const visibleRoute = route.filter({ visible: true });
	if (visible) await expect(visibleRoute).not.toHaveCount(0);
	else await expect(visibleRoute).toHaveCount(0);
}

export async function verifyAdminNavigation(page: Page) {
	await signIn(page, E2E_USERS.admin.email);
	await expectRouteVisible(page, navigation.users, true);
	await expectRouteVisible(page, navigation.reports, true);
	await expectRouteVisible(page, navigation.roles, true);
	await expectRouteVisible(page, navigation.catalog, true);
	await expectRouteVisible(page, navigation.orders, false);
	await expectRouteVisible(page, navigation.programs, false);
	await expectRouteVisible(page, navigation.claims, false);
	await expectRouteVisible(page, navigation.customers, false);
}

async function verifyDashboardPersona(
	page: Page,
	username: string,
	canSeeOperationalLists: boolean,
	canSeeAccountManagement: boolean,
	canCreatePrograms: boolean,
) {
	const requestedPaths = new Set<string>();
	page.on("request", (request) => {
		const path = new URL(request.url()).pathname;
		if (path.startsWith("/api/proxy/")) requestedPaths.add(path);
	});

	await signIn(page, username);

	await expect(
		page.getByText(translate(Messages.dashboard.activity.title), {
			exact: true,
		}),
	).toBeVisible();
	await expect
		.poll(() => requestedPaths.has("/api/proxy/reports/orders"))
		.toBe(true);

	for (const [key, label] of [
		["orders", Messages.dashboard.orders.title],
		["programs", Messages.dashboard.programs.title],
		["claims", Messages.dashboard.claims.title],
	] as const) {
		const title = page.getByText(translate(label), { exact: true });
		if (canSeeOperationalLists) {
			await expect(title).toBeVisible();
			await expect
				.poll(() => requestedPaths.has(`/api/proxy/${key}`))
				.toBe(true);
		} else {
			await expect(title).toHaveCount(0);
			expect(requestedPaths.has(`/api/proxy/${key}`)).toBe(false);
		}
	}

	const accountsTitle = page.getByText(
		translate(Messages.dashboard.accounts.title),
		{ exact: true },
	);
	if (canSeeAccountManagement) {
		await expect(accountsTitle).toBeVisible();
		await expect.poll(() => requestedPaths.has("/api/proxy/users")).toBe(true);
	} else {
		await expect(accountsTitle).toHaveCount(0);
		expect(requestedPaths.has("/api/proxy/users")).toBe(false);
	}

	const readyOrdersTitle = page.getByText(
		translate(Messages.dashboard.readyOrders.title),
		{ exact: true },
	);
	if (canCreatePrograms) {
		await expect(readyOrdersTitle).toBeVisible();
		await expect
			.poll(() => requestedPaths.has("/api/proxy/orders/eligible-for-programs"))
			.toBe(true);
	} else {
		await expect(readyOrdersTitle).toHaveCount(0);
		expect(requestedPaths.has("/api/proxy/orders/eligible-for-programs")).toBe(
			false,
		);
	}
}

export async function verifyAdminDashboard(page: Page) {
	await verifyDashboardPersona(page, E2E_USERS.admin.email, false, true, false);
}

export async function verifyAdminDashboardApiRecovery(page: Page) {
	let apiHealthy = false;
	let reportUnavailable = true;
	await page.route("**/api/proxy/reports/orders*", async (route) => {
		if (reportUnavailable) {
			await route.fulfill({
				status: 503,
				contentType: "application/json",
				body: JSON.stringify({
					code: API_TRANSPORT_ERROR_CODES.API_UNAVAILABLE,
					statusCode: 503,
				}),
			});
			return;
		}
		await route.continue();
	});
	await page.route("**/api/proxy/health", async (route) => {
		await route.fulfill({
			status: apiHealthy ? 200 : 503,
			contentType: "application/json",
			body: JSON.stringify(apiHealthy ? { status: "ok" } : {}),
		});
	});

	await signIn(page, E2E_USERS.admin.email);
	const failureMessage = page.getByText(
		translate(Messages.dashboard.activity.loadFailed),
		{ exact: true },
	);
	await expect(failureMessage).toBeVisible();
	await expect(
		page.getByRole("button", {
			name: translate(Messages.dashboard.activity.retry),
		}),
	).toBeEnabled();

	reportUnavailable = false;
	apiHealthy = true;
	await page.evaluate(() => window.dispatchEvent(new Event("online")));
	await expect(failureMessage).toBeHidden({ timeout: 10_000 });
	await expect(
		page.getByText(translate(Messages.dashboard.activity.statusTitle), {
			exact: true,
		}),
	).toBeVisible();
}

export async function verifyAgentDashboard(page: Page) {
	await verifyDashboardPersona(
		page,
		E2E_USERS.agentAssigned.employeeCode as string,
		true,
		false,
		true,
	);
}

export async function verifyClientDashboard(page: Page) {
	await verifyDashboardPersona(
		page,
		E2E_USERS.clientA.email,
		true,
		false,
		false,
	);
}

export async function verifyAdminReportCsvExport(page: Page) {
	await signIn(page, E2E_USERS.admin.email);
	await page.goto("/dashboard/reports");
	const exportButton = page.getByRole("button", {
		name: translate(Messages.reports.exportCsv),
		exact: true,
	});
	await expect(exportButton).toBeEnabled();

	const downloadPromise = page.waitForEvent("download");
	await exportButton.click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toMatch(
		/^ecommand-order-report(?:-.*)?\.csv$/,
	);
	const filePath = await download.path();
	expect(filePath).toBeTruthy();
	const csv = await readFile(filePath as string, "utf8");
	expect(csv).toContain(translate(Messages.reports.byStatus));
	expect(csv).toContain(translate(Messages.reports.byCustomer));
}

export async function verifyAdminCatalogLifecycle(page: Page) {
	await signIn(page, E2E_USERS.admin.email);
	await page.goto("/dashboard/catalog");

	const unitCategory = translate(Messages.referenceData.sections.units);
	await page.getByRole("button", { name: unitCategory, exact: true }).click();
	await expect(page.getByRole("heading", { name: unitCategory })).toBeVisible();

	const originalName = `E2E unit ${Date.now()}`;
	const renamedName = `${originalName} renamed`;
	await page
		.getByRole("button", {
			name: translate(Messages.referenceData.add),
			exact: true,
		})
		.click();

	let dialog = page.getByRole("dialog");
	await dialog
		.getByLabel(translate(Messages.referenceData.name), { exact: true })
		.fill(originalName);
	await dialog
		.getByRole("button", {
			name: translate(Messages.referenceData.add),
			exact: true,
		})
		.click();
	await expect(dialog).toBeHidden();
	await expect(page.getByRole("button", { name: originalName })).toBeVisible();

	await page.getByRole("button", { name: originalName, exact: true }).click();
	dialog = page.getByRole("dialog");
	await dialog
		.getByLabel(translate(Messages.referenceData.name), { exact: true })
		.fill(renamedName);
	await dialog
		.getByRole("button", {
			name: translate(Messages.common.actions.save),
			exact: true,
		})
		.click();
	await expect(dialog).toBeHidden();
	await expect(page.getByRole("button", { name: renamedName })).toBeVisible();

	await page.getByRole("button", { name: renamedName, exact: true }).click();
	dialog = page.getByRole("dialog");
	await dialog.getByRole("checkbox").uncheck();
	await dialog
		.getByRole("button", {
			name: translate(Messages.common.actions.save),
			exact: true,
		})
		.click();
	await expect(dialog).toBeHidden();
	const archivedRow = page
		.getByRole("row")
		.filter({ has: page.getByRole("button", { name: renamedName }) });
	await expect(archivedRow).toContainText(
		translate(Messages.referenceData.archived),
	);

	await page.getByRole("button", { name: renamedName, exact: true }).click();
	dialog = page.getByRole("dialog");
	await dialog.getByRole("checkbox").check();
	await dialog
		.getByRole("button", {
			name: translate(Messages.common.actions.save),
			exact: true,
		})
		.click();
	await expect(dialog).toBeHidden();
	const restoredRow = page
		.getByRole("row")
		.filter({ has: page.getByRole("button", { name: renamedName }) });
	await expect(restoredRow).toContainText(
		translate(Messages.referenceData.active),
	);
}

export async function verifyAgentNavigation(page: Page) {
	await signIn(page, E2E_USERS.agentAssigned.employeeCode as string);
	await expectRouteVisible(page, navigation.orders, true);
	await expectRouteVisible(page, navigation.programs, true);
	await expectRouteVisible(page, navigation.claims, true);
	await expectRouteVisible(page, navigation.customers, true);
	await expectRouteVisible(page, navigation.users, false);
	await expectRouteVisible(page, navigation.roles, false);
	await expectRouteVisible(page, navigation.catalog, false);
	await page
		.getByRole("link", { name: navigation.claims, exact: true })
		.click();
	await expect(page).toHaveURL(/\/dashboard\/claims$/);
	await expect(
		page.getByRole("link", {
			name: translate(Messages.claims.create),
			exact: true,
		}),
	).toBeVisible();
}

export async function verifyAdminCustomRoleAssignment(page: Page) {
	await signIn(page, E2E_USERS.admin.email);

	const roleName = `E2E order reader ${Date.now()}`;
	await page.goto("/dashboard/roles");
	await page
		.getByRole("button", {
			name: translate(Messages.roleProfiles.create),
			exact: true,
		})
		.click();
	const roleDialog = page.getByRole("dialog");
	await roleDialog
		.getByLabel(translate(Messages.roleProfiles.name), { exact: true })
		.fill(roleName);
	await roleDialog.locator('label[for="role-permission-orders-read"]').click();
	await roleDialog
		.getByRole("button", {
			name: translate(Messages.roleProfiles.save),
			exact: true,
		})
		.click();
	await expect(roleDialog).toBeHidden();
	await expect(page.getByRole("cell", { name: roleName })).toBeVisible();

	const email = `e2e.order-reader.${Date.now()}@example.test`;
	await page.goto("/dashboard/users/new");
	await page.locator("#email").fill(email);
	await page.locator("#password").fill(E2E_PASSWORD);
	await page
		.getByRole("button", {
			name: translate(Messages.common.actions.continue),
			exact: true,
		})
		.click();
	await page.locator("#firstName").fill("E2E");
	await page.locator("#lastName").fill("Order Reader");
	await page.locator("#roleId").click();
	await page.getByRole("option", { name: roleName, exact: true }).click();
	await page
		.getByRole("button", {
			name: translate(Messages.users.form.actions.create),
			exact: true,
		})
		.click();
	await expect(page).toHaveURL(/\/dashboard\/users\/[0-9a-f-]+$/i);

	await page.context().clearCookies();
	await signIn(page, email);
	await expectRouteVisible(page, navigation.orders, true);
	await expectRouteVisible(page, navigation.users, false);
	const ordersUrl = new URL("/api/proxy/orders", page.url()).href;
	const readResponse = await page.request.get(ordersUrl);
	expect(readResponse.status()).toBe(200);
	const writeResponse = await page.request.post(ordersUrl, { data: {} });
	expect(writeResponse.status()).toBe(403);
	expect(await writeResponse.json()).toMatchObject({
		code: API_ERROR_CODES.ACCESS_DENIED,
	});
}

export async function verifyAdminRegistrationReview(page: Page) {
	const email = `e2e.registration.${Date.now()}@example.test`;
	await page.goto("/signup");
	await page.locator("#registration-first-name").fill("Pending");
	await page.locator("#registration-last-name").fill("Applicant");
	await page
		.locator("#registration-customer-code")
		.fill(E2E_CUSTOMERS.assignedA);
	await page.locator("#registration-ice").fill(E2E_CUSTOMER_ICE.assignedA);
	await page
		.getByRole("button", {
			name: translate(Messages.auth.signup.continue),
			exact: true,
		})
		.click();
	await page.locator("#registration-email").fill(email);
	await page.locator("#registration-password").fill("E2eStrongPass1!");
	await page
		.locator("#registration-password-confirmation")
		.fill("E2eStrongPass1!");
	await page
		.getByRole("button", {
			name: translate(Messages.auth.signup.requestAccess),
			exact: true,
		})
		.click();
	await expect(
		page.getByText(translate(Messages.auth.signup.requestReview)),
	).toBeVisible();

	await signIn(page, E2E_USERS.admin.email);
	await page.goto("/dashboard/users?registrationStatus=PENDING");
	const applicantLink = page.getByRole("link", { name: email, exact: true });
	await expect(applicantLink).toBeVisible();
	await applicantLink.click();
	await expect(page).toHaveURL(/\/dashboard\/users\/\d+$/);
	await expect(
		page.getByRole("button", {
			name: translate(Messages.users.actions.approve),
			exact: true,
		}),
	).toBeVisible();
	const reviewResponse = page.waitForResponse(
		(response) =>
			response.request().method() === "PUT" &&
			/\/api\/proxy\/users\/\d+\/registration-status$/.test(
				new URL(response.url()).pathname,
			),
	);
	await page
		.getByRole("button", {
			name: translate(Messages.users.actions.approve),
			exact: true,
		})
		.click();
	expect((await reviewResponse).status()).toBe(200);
	const usersResponse = await page.request.get(
		new URL("/api/proxy/users", page.url()).href,
	);
	expect(usersResponse.status()).toBe(200);
	const users = (await usersResponse.json()) as Array<{
		email: string;
		registrationStatus: string;
		isActive: boolean;
	}>;
	expect(users.find((user) => user.email === email)).toMatchObject({
		registrationStatus: "APPROVED",
		isActive: true,
	});
}
export async function verifyAgentOperationalCreation(page: Page) {
	await signIn(page, E2E_USERS.agentAssigned.employeeCode as string);
	await page.goto("/dashboard/claims/new");
	await page.locator("#customerId").click();
	await page
		.getByRole("option", { name: "E2E Assigned Customer A", exact: true })
		.click();
	await page
		.getByRole("button", {
			name: translate(Messages.common.actions.continue),
			exact: true,
		})
		.click();
	await page
		.locator("#description")
		.fill("E2E agent claim creation workflow check.");
	let failClaimCreate = true;
	await page.route("**/api/proxy/claims", async (route) => {
		if (
			failClaimCreate &&
			route.request().method() === "POST" &&
			new URL(route.request().url()).pathname === "/api/proxy/claims"
		) {
			failClaimCreate = false;
			await route.fulfill({
				status: 500,
				contentType: "application/json",
				body: JSON.stringify({
					code: API_ERROR_CODES.INTERNAL_ERROR,
					statusCode: 500,
				}),
			});
			return;
		}
		await route.continue();
	});
	const failedCreateResponse = page.waitForResponse(
		(response) =>
			response.request().method() === "POST" &&
			new URL(response.url()).pathname === "/api/proxy/claims",
	);
	await page
		.getByRole("button", {
			name: translate(Messages.claims.create),
			exact: true,
		})
		.click();
	expect((await failedCreateResponse).status()).toBe(500);
	const failureAlert = page.locator('[role="alert"].text-destructive');
	await expect(failureAlert).toContainText(
		translate(Messages.apiError.internal),
	);
	await expect(page).toHaveURL(/\/dashboard\/claims\/new$/);
	if (process.env.E2E_CAPTURE_DIR) {
		await mkdir(process.env.E2E_CAPTURE_DIR, { recursive: true });
		await page.setViewportSize({ width: 390, height: 844 });
		await page.screenshot({
			path: join(process.env.E2E_CAPTURE_DIR, "claim-submit-error-phone.png"),
			fullPage: true,
		});
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.screenshot({
			path: join(process.env.E2E_CAPTURE_DIR, "claim-submit-error-desktop.png"),
			fullPage: true,
		});
	}
	const claimCreateResponse = page.waitForResponse(
		(response) =>
			response.request().method() === "POST" &&
			new URL(response.url()).pathname === "/api/proxy/claims",
	);
	await page
		.getByRole("button", {
			name: translate(Messages.claims.create),
			exact: true,
		})
		.click();
	expect((await claimCreateResponse).status()).toBe(201);
	await expect(page).toHaveURL(/\/dashboard\/claims\/CLM-[A-Z0-9]+$/);
	await expect(page.getByRole("heading")).toContainText(/CLM-/);

	const programCreateRequests: string[] = [];
	page.on("request", (request) => {
		if (
			request.method() === "POST" &&
			/\/programs(?:\?|$)/.test(request.url())
		) {
			programCreateRequests.push(request.url());
		}
	});

	const openProgramForm = async () => {
		await page.goto(`/dashboard/orders/${E2E_ORDERS.assignedB}`);
		await page
			.getByRole("link", {
				name: translate(Messages.orders.detail.createProgram),
				exact: true,
			})
			.click();
		await expect(page.locator("#orderId")).toHaveValue(E2E_ORDERS.assignedB);
	};

	const planAndContinue = async () => {
		await page.locator("#plannedDate").fill("2026-10-10");
		await page.locator("#quantityPlanned").fill("20");
		await page
			.getByRole("button", {
				name: translate(Messages.common.actions.continue),
				exact: true,
			})
			.click();
		await expect(page.locator("#quantityRealized")).toBeVisible();
		expect(programCreateRequests).toHaveLength(0);
	};

	await openProgramForm();
	await planAndContinue();
	await page
		.getByRole("button", {
			name: translate(Messages.common.actions.cancel),
			exact: true,
		})
		.click();
	await expect(page).toHaveURL(
		new RegExp(`/dashboard/orders/${E2E_ORDERS.assignedB}$`),
	);

	await openProgramForm();
	await planAndContinue();
	await page
		.getByRole("button", {
			name: translate(Messages.programs.createForm.create),
			exact: true,
		})
		.click();
	await expect(page).toHaveURL(/\/dashboard\/programs\/PRG-[A-Z0-9]+$/);
	await expect(page.getByRole("heading")).toContainText(/PRG-/);
	expect(programCreateRequests).toHaveLength(1);
}
export async function verifyClientOrderSubmission(page: Page) {
	await signIn(page, E2E_USERS.clientA.email);
	const orderCreateRequests: string[] = [];
	page.on("request", (request) => {
		if (
			request.method() === "POST" &&
			new URL(request.url()).pathname.endsWith("/orders")
		) {
			orderCreateRequests.push(request.url());
		}
	});
	await page.goto("/dashboard/orders/new");
	await page.locator("#goodsId").click();
	await page
		.getByRole("option", { name: "E2E Test Cereals", exact: true })
		.click();
	await page.locator("#unitId").click();
	await page.locator("#unitId").fill("Tonnes");
	await page.locator("#unitId").press("ArrowDown");
	await page.locator("#unitId").press("Enter");
	await page.locator("#quantityDemanded").fill("7");
	await page
		.getByRole("button", {
			name: translate(Messages.common.actions.continue),
			exact: true,
		})
		.click();
	await expect(
		page.getByRole("region", {
			name: translate(Messages.orders.createForm.scheduleTitle),
		}),
	).toBeVisible();
	await expect(page).toHaveURL(/\/dashboard\/orders\/new$/);
	expect(orderCreateRequests).toHaveLength(0);

	const createResponse = page.waitForResponse(
		(response) =>
			response.request().method() === "POST" &&
			new URL(response.url()).pathname.endsWith("/orders"),
	);
	await page
		.getByRole("button", {
			name: translate(Messages.orders.createForm.create),
			exact: true,
		})
		.click();
	expect((await createResponse).status()).toBe(201);
	expect(orderCreateRequests).toHaveLength(1);
	await expect(page).toHaveURL(/\/dashboard\/orders\/ORD-[A-Z0-9]+$/);
	await expect(page.getByRole("heading")).toContainText(/ORD-/);
}
export async function verifyClientAuthorization(page: Page) {
	await signIn(page, E2E_USERS.clientA.email);
	await expectRouteVisible(page, navigation.orders, true);
	await expectRouteVisible(page, navigation.programs, true);
	await expectRouteVisible(page, navigation.claims, true);
	await expectRouteVisible(page, navigation.customers, false);
	await expectRouteVisible(page, navigation.roles, false);
	await expectRouteVisible(page, navigation.catalog, false);
	await expectRouteVisible(page, navigation.users, false);

	const response = await page.request.get(
		new URL("/api/proxy/users", page.url()).href,
	);
	expect(response.status()).toBe(403);
	expect(await response.json()).toMatchObject({
		code: API_ERROR_CODES.ACCESS_DENIED,
	});
}

export async function verifyAdminReportPrintLayout(page: Page) {
	await signIn(page, E2E_USERS.admin.email);
	let reportMocked = false;
	await page.route("**/*", async (route) => {
		if (!route.request().url().includes("/reports/orders")) {
			await route.continue();
			return;
		}
		reportMocked = true;
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				from: null,
				to: null,
				totalOrders: 720,
				byStatus: [{ id: "APPROVED", name: "APPROVED", count: 720 }],
				byCustomer: Array.from({ length: 36 }, (_, index) => ({
					id: `customer-${index}`,
					name: `Customer ${index + 1} with a long business name to check print wrapping`,
					count: 36 - index,
				})),
				byProduct: Array.from({ length: 36 }, (_, index) => ({
					id: `product-${index}`,
					name: `Commodity ${index + 1} with a long catalog label for print wrapping`,
					count: 36 - index,
				})),
				byMonth: Array.from({ length: 12 }, (_, index) => ({
					month: `2026-${String(index + 1).padStart(2, "0")}`,
					count: 60 - index,
				})),
			}),
		});
	});
	await page.goto("/dashboard/reports");
	await expect(
		page.getByRole("heading", { name: translate(Messages.reports.title) }),
	).toBeVisible();
	await expect.poll(() => reportMocked).toBe(true);
	await page.evaluate(() =>
		document.documentElement.setAttribute("data-theme", "dark"),
	);
	const screenCardColor = await page
		.locator("[data-report-print-root] [data-slot=card]")
		.first()
		.evaluate((element) => getComputedStyle(element).backgroundColor);
	await page.emulateMedia({ media: "print" });
	await expect(page.locator("#report-from")).toBeHidden();
	await expect(
		page.getByRole("button", { name: translate(Messages.reports.print) }),
	).toBeHidden();
	const printCard = page
		.locator("[data-report-print-root] [data-slot=card]")
		.first();
	await expect(printCard).toBeVisible();
	const printStyle = await printCard.evaluate((element) => ({
		background: getComputedStyle(element).backgroundColor,
		colorScheme: getComputedStyle(document.documentElement).colorScheme,
	}));
	expect(printStyle.background).not.toBe(screenCardColor);
	expect(printStyle.colorScheme).toBe("light");
	const longName = page.locator(".report-print-name").first();
	await longName.evaluate((element) => {
		element.textContent = "Long commodity name ".repeat(12);
	});
	const nameStyle = await longName.evaluate((element) => ({
		whiteSpace: getComputedStyle(element).whiteSpace,
		textOverflow: getComputedStyle(element).textOverflow,
	}));
	expect(nameStyle).toEqual({ whiteSpace: "normal", textOverflow: "clip" });
	const pdf = await page.pdf({
		format: "A4",
		printBackground: true,
		displayHeaderFooter: false,
	});
	expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
	const pdfPageCount = Number(
		pdf
			.toString("latin1")
			.match(/\/Type \/Pages\b[\s\S]*?\/Count (\d+)/)?.[1] ?? "0",
	);
	expect(pdfPageCount).toBeGreaterThan(1);
}
