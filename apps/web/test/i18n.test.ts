import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	API_ERROR_CODES,
	API_RESPONSE_CODES,
	API_TRANSPORT_ERROR_CODES,
	API_VALIDATION_RULE_CODES,
	DEFAULT_LOCALE,
} from "@ecommand/shared";
import ts from "typescript";
import {
	apiErrorMessages,
	isAppLocale,
	Messages,
	resolveAppLocale,
	SUPPORTED_LOCALES,
	translate,
	translateApiError,
	translateApiResponse,
	translateApiValidationRule,
} from "../src/i18n";
import { en } from "../src/i18n/messages/en";

function collectCatalogKeys(value: unknown, prefix: string[] = []): string[] {
	if (typeof value === "string") return [prefix.join(".")];
	if (!value || typeof value !== "object") return [];
	const entries = Object.entries(value);
	if (entries.length === 1 && entries[0][0] === "plural") {
		return [prefix.join(".")];
	}
	return entries.flatMap(([key, child]) =>
		collectCatalogKeys(child, [...prefix, key]),
	);
}

function collectMessageReferences(value: unknown): string[] {
	if (typeof value === "string") return [value];
	if (!value || typeof value !== "object") return [];
	return Object.values(value).flatMap(collectMessageReferences);
}

assert.equal(DEFAULT_LOCALE, "en");
assert.ok(SUPPORTED_LOCALES.includes(DEFAULT_LOCALE));
assert.equal(resolveAppLocale(undefined), DEFAULT_LOCALE);
assert.equal(resolveAppLocale("fr"), DEFAULT_LOCALE);
for (const locale of SUPPORTED_LOCALES) {
	assert.equal(isAppLocale(locale), true);
	assert.equal(resolveAppLocale(locale), locale);
}
assert.equal(isAppLocale("fr"), false);
const catalogKeys = collectCatalogKeys(en).sort();
const messageReferences = collectMessageReferences(Messages).sort();
assert.deepEqual(messageReferences, catalogKeys);
assert.equal(
	new Set(messageReferences).size,
	messageReferences.length,
	"Each catalog message should have one stable key reference",
);

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../src");
const referencedMessages = new Set<string>();
const dynamicMessagePrefixes = new Set<string>();

function getMessagesPath(
	node: ts.Node,
): { path: string; dynamic: boolean } | undefined {
	const parts: string[] = [];
	let current = node;
	let dynamic = false;
	while (
		ts.isPropertyAccessExpression(current) ||
		ts.isElementAccessExpression(current)
	) {
		if (ts.isPropertyAccessExpression(current)) {
			parts.unshift(current.name.text);
			current = current.expression;
		} else {
			dynamic = true;
			current = current.expression;
		}
	}
	return ts.isIdentifier(current) && current.text === "Messages"
		? { path: parts.join("."), dynamic }
		: undefined;
}

function scanMessageReferences(directory: string) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const file = join(directory, entry.name);
		if (entry.isDirectory()) {
			if (!file.includes("/i18n/messages")) scanMessageReferences(file);
			continue;
		}
		if (
			!/\.tsx?$/.test(entry.name) ||
			file.endsWith("/i18n/message-keys.ts") ||
			file.includes("/lib/api/generated.")
		) {
			continue;
		}
		const source = ts.createSourceFile(
			file,
			readFileSync(file, "utf8"),
			ts.ScriptTarget.Latest,
			true,
			file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
		);
		function visit(node: ts.Node) {
			const reference = getMessagesPath(node);
			if (reference?.path) {
				if (reference.dynamic) dynamicMessagePrefixes.add(reference.path);
				else referencedMessages.add(reference.path);
			}
			ts.forEachChild(node, visit);
		}
		visit(source);
	}
}

scanMessageReferences(sourceRoot);
const unusedMessages = messageReferences.filter(
	(key) =>
		!referencedMessages.has(key) &&
		![...dynamicMessagePrefixes].some((prefix) => key.startsWith(`${prefix}.`)),
);
assert.deepEqual(
	unusedMessages,
	[],
	`Unused English message aliases should be removed or referenced: ${unusedMessages.join(", ")}`,
);

const requestDtoRoot = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"../../api/src",
);
const apiFieldLabels = new Set(Object.keys(en.common.fields));
const decoratedRequestFields = new Set<string>();

function scanRequestDtos(directory: string) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const file = join(directory, entry.name);
		if (entry.isDirectory()) {
			scanRequestDtos(file);
			continue;
		}
		if (!entry.name.endsWith(".dto.ts") || !file.includes("/requests/")) {
			continue;
		}

		const source = ts.createSourceFile(
			file,
			readFileSync(file, "utf8"),
			ts.ScriptTarget.Latest,
			true,
		);
		function visit(node: ts.Node) {
			if (ts.isPropertyDeclaration(node) && ts.canHaveDecorators(node)) {
				const decorators = ts.getDecorators(node) ?? [];
				const hasValidator = decorators.some((decorator) => {
					const name = ts.isCallExpression(decorator.expression)
						? decorator.expression.expression.getText(source)
						: decorator.expression.getText(source);
					return /^(Is|Length|Matches|Array|Optional|Validate)/.test(name);
				});
				if (hasValidator) decoratedRequestFields.add(node.name.getText(source));
			}
			ts.forEachChild(node, visit);
		}
		visit(source);
	}
}

scanRequestDtos(requestDtoRoot);
assert.deepEqual(
	[...decoratedRequestFields].filter((field) => !apiFieldLabels.has(field)),
	[],
	"Every validated API request field should have a localized label",
);
assert.equal(translate("common.actions.continue"), "Continue");

function assertInterpolationTypeContract() {
	translate(Messages.dashboard.welcome, { name: "Samira Admin" });
	// @ts-expect-error Interpolated messages require every named value.
	translate(Messages.dashboard.welcome);
	// @ts-expect-error Values must use the placeholder names in the catalog.
	translate(Messages.dashboard.welcome, { firstName: "Samira" });
	translate(Messages.orders.pageTitle);
}

void assertInterpolationTypeContract;
assert.equal(translate("navigation.users"), "Users");
assert.equal(translate("navigation.freightPortal"), "Freight Portal");
assert.equal(translate("common.actions.logOut"), "Log out");
assert.equal(translate("settings.sync.saved"), "Synced");
assert.equal(
	translate("common.accessibility.tableScrollHint"),
	"Scroll to see the remaining columns",
);
assert.equal(
	translate("units.select.noneAvailable"),
	"No units are available.",
);
assert.equal(
	translate("goods.select.noneAvailable"),
	"No active goods are available.",
);
assert.equal(
	translate("common.formSteps.stepOf", {
		current: 2,
		total: 3,
		title: "Profile",
	}),
	"Step 2 of 3: Profile",
);
assert.equal(
	translate("apiError.validationFailed"),
	"Please check the entered values and try again.",
);
assert.equal(
	translate("settings.appearance.options.theme.dark.label"),
	"Charcoal dark",
);
assert.equal(
	translate("settings.profile.customerCode", { code: "ACME" }),
	"Customer code: ACME",
);
assert.equal(
	translate("settings.profile.customerAccountCodeFallback", { id: 42 }),
	"Customer account #42",
);
assert.equal(translate("notifications.title"), "Notifications");
assert.equal(translate("auth.login.title"), "Sign in");
assert.equal(translate("errorPage.title"), "This page ran into a problem");
assert.equal(
	translate("errorPage.formSubmitted"),
	"If you were submitting a form, check whether it completed before trying again.",
);
assert.equal(
	translate("errorPage.apiUnavailableDetails"),
	"The ECommand API is temporarily unavailable. Your session is safe; retry in a moment.",
);
assert.equal(
	translate("common.underConstruction.description"),
	"This page is being built. Check back soon.",
);
assert.equal(
	translate("dashboard.welcome", { name: "Safa Admin" }),
	"Welcome back, Safa Admin",
);
assert.equal(
	translate("dashboard.registrations.pending", { count: 2 }),
	"2 pending",
);
assert.equal(translate("reports.title"), "Order reports");
assert.equal(translate("orders.eligible.title"), "Eligible orders");
assert.equal(
	translate("orders.editForm.pageTitle", { orderCode: "ORD-ABC123" }),
	"Edit ORD-ABC123",
);
assert.equal(translate("orders.eligible.page", { page: 2 }), "Page 2");
assert.equal(translate("orders.detail.forecastPrograms"), "Forecast programs");
assert.equal(translate("users.list.allReviewStatuses"), "All review statuses");
assert.equal(
	translate("users.form.validation.customerRequired"),
	"Select the customer this representative belongs to.",
);
assert.equal(
	translate("users.actions.rejectDescription", { name: "Safa Bechchaa" }),
	"Rejecting Safa Bechchaa's request keeps this account inactive. This decision cannot be changed from the request screen.",
);
assert.equal(
	translate("users.portfolio.selectedCount", { count: 4 }),
	"4 customers selected",
);
assert.equal(
	translate("users.portfolio.selectedCount", { count: 1 }),
	"1 customer selected",
);
assert.equal(
	translate("users.portfolio.selectedCount", { count: 0 }),
	"No customers selected",
);
assert.equal(
	translate("users.pendingCount", { count: 1 }),
	"1 client access request is awaiting review.",
);
assert.equal(
	translate("users.pendingCount", { count: 3 }),
	"3 client access requests are awaiting review.",
);
assert.equal(translate("programs.createTitle"), "New program");
assert.equal(
	translate("programs.editTitle", { programCode: "PRG-ABC123" }),
	"Edit PRG-ABC123",
);
assert.equal(
	translate("programs.detail.historyEvents.completion", {
		quantity: "450",
		rate: 90,
	}),
	"450 realized · 90% complete",
);
assert.equal(translate("customers.createTitle"), "New customer");
assert.equal(
	translate("customers.form.maxCharacters", { count: 15 }),
	"Max 15 characters",
);
assert.equal(
	translate("customers.codeDescription", { code: "CUST-ACME" }),
	"Code: CUST-ACME",
);
assert.equal(
	translate("reports.periodRange", { from: "Sep 1", to: "Sep 30" }),
	"Sep 1 to Sep 30",
);
assert.equal(
	translate("auth.signup.passwordRequirements.minimumLength"),
	"8+ characters",
);
assert.equal(
	translate("auth.recovery.requestAccepted"),
	"If an account matches that address, a reset link will be sent.",
);
assert.equal(
	translate("notifications.buttonLabelWithUnread", { count: 3 }),
	"Notifications, 3 unread notifications",
);
assert.equal(
	translate("notifications.buttonLabelWithUnread", { count: 1 }),
	"Notifications, 1 unread notification",
);
assert.equal(
	translate("notifications.unreadCount", { count: 1 }),
	"1 unread notification",
);
assert.equal(
	translate("notifications.unreadCount", { count: 4 }),
	"4 unread notifications",
);
assert.equal(
	translate("claims.conversation.openCount", {
		count: 1,
		unreadSuffix: "",
	}),
	"Open conversation, 1 message",
);
assert.equal(
	translate("claims.conversation.openCount", {
		count: 2,
		unreadSuffix: "",
	}),
	"Open conversation, 2 messages",
);
assert.equal(
	translateApiError(API_ERROR_CODES.ORDER_ALREADY_PROGRAMMED),
	"This order already has a forecast program.",
);
assert.equal(
	translateApiError(API_ERROR_CODES.CLAIM_COMMENT_NOT_FOUND),
	"This claim message could not be found.",
);
assert.equal(
	translateApiError(API_ERROR_CODES.ACCESS_DENIED),
	"You do not have permission to perform this action.",
);
assert.equal(
	translateApiError(API_TRANSPORT_ERROR_CODES.API_UNAVAILABLE),
	"The ECommand API could not be reached.",
);
for (const code of [
	API_ERROR_CODES.DUPLICATE_ORDER_ATTRIBUTE,
	API_ERROR_CODES.DUPLICATE_PARAMETRIZATION,
	API_ERROR_CODES.DUPLICATE_ORDER_SHARE,
	API_ERROR_CODES.DUPLICATE_PROGRAM_CONVOI,
]) {
	assert.equal(
		translateApiError(code),
		"This action conflicts with the current record state.",
		`${code} should use conflict copy instead of duplicate-name copy`,
	);
}
assert.equal(
	translateApiError("UNMAPPED_DOMAIN_CODE"),
	"The request could not be completed. Please try again.",
);
for (const code of Object.values(API_ERROR_CODES)) {
	assert.ok(
		Object.hasOwn(apiErrorMessages, code),
		`API error ${code} should have an explicit message mapping`,
	);
	if (code === API_ERROR_CODES.REQUEST_FAILED) continue;
	assert.notEqual(
		translateApiError(code),
		translate("apiError.requestFailed"),
		`API error ${code} should have an explicit English message mapping`,
	);
}
for (const code of Object.values(API_VALIDATION_RULE_CODES)) {
	assert.ok(
		translateApiValidationRule(code),
		`API validation rule ${code} should have an English message`,
	);
}
for (const code of Object.values(API_RESPONSE_CODES)) {
	assert.ok(
		translateApiResponse(code),
		`API response ${code} should have an explicit English message mapping`,
	);
}
assert.equal(
	translateApiResponse(API_RESPONSE_CODES.REGISTRATION_SUBMITTED_FOR_REVIEW),
	"Registration submitted for admin review.",
);

console.log("English message catalog and API code mapping checks passed.");
