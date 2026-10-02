import assert from "node:assert/strict";
import { filterPermissionsBySearch } from "../src/lib/permission-search";

const permissions = [
	{
		name: "orders:read",
		description: "View order details and lists",
		assignable: true,
	},
	{
		name: "orders:action/send-to-dtm",
		description: "Send orders to DTM for processing",
		assignable: true,
	},
	{
		name: "claims:manage:status",
		description: "Change claim status",
		assignable: true,
	},
];

assert.deepEqual(filterPermissionsBySearch(permissions, ""), permissions);
assert.deepEqual(filterPermissionsBySearch(permissions, "  ORDERS "), [
	permissions[0],
	permissions[1],
]);
assert.deepEqual(filterPermissionsBySearch(permissions, "send-to-dtm"), [
	permissions[1],
]);
assert.deepEqual(filterPermissionsBySearch(permissions, "send to dtm"), [
	permissions[1],
]);
assert.deepEqual(filterPermissionsBySearch(permissions, "manage status"), [
	permissions[2],
]);
assert.deepEqual(filterPermissionsBySearch(permissions, "change claim"), [
	permissions[2],
]);
assert.deepEqual(filterPermissionsBySearch(permissions, "view orders"), [
	permissions[0],
]);
assert.deepEqual(filterPermissionsBySearch(permissions, "   "), permissions);
assert.deepEqual(filterPermissionsBySearch(permissions, "unknown"), []);

console.log("Permission search checks passed.");
