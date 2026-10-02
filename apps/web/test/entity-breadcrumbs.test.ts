import assert from "node:assert/strict";
import {
	type MessageKey,
	Messages,
	type TypedMessageTranslator,
} from "../src/i18n";
import { createEntityBreadcrumbs } from "../src/lib/entity-breadcrumbs";

const breadcrumbs = createEntityBreadcrumbs({
	resourceKey: Messages.orders.pageTitle,
	baseUrl: "/dashboard/orders",
	createKey: Messages.orders.createForm.title,
	editKey: Messages.orders.actions.edit,
});
const translator = ((key: MessageKey) => `[${key}]`) as TypedMessageTranslator;

assert.deepEqual(breadcrumbs.home(translator), [
	{ label: `[${Messages.orders.pageTitle}]`, href: "/dashboard/orders" },
]);
assert.deepEqual(breadcrumbs.create(translator), [
	{ label: `[${Messages.orders.pageTitle}]`, href: "/dashboard/orders" },
	{ label: `[${Messages.orders.createForm.title}]` },
]);
assert.deepEqual(
	breadcrumbs.detail("ORD-ABCDEFGHJK", "Sample order", translator),
	[
		{ label: `[${Messages.orders.pageTitle}]`, href: "/dashboard/orders" },
		{
			label: "Sample order",
			href: "/dashboard/orders/ORD-ABCDEFGHJK",
		},
	],
);
assert.deepEqual(
	breadcrumbs.edit("ORD-ABCDEFGHJK", "Sample order", translator),
	[
		{ label: `[${Messages.orders.pageTitle}]`, href: "/dashboard/orders" },
		{
			label: "Sample order",
			href: "/dashboard/orders/ORD-ABCDEFGHJK",
		},
		{ label: `[${Messages.orders.actions.edit}]` },
	],
);

console.log("Explicit-locale breadcrumb factory checks passed.");
