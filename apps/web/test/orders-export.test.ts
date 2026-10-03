import assert from "node:assert/strict";
import type {
	OrderListDto,
	OrdersControllerFindAllParams,
} from "../src/lib/api/generated.schemas";
import {
	fetchAllOrdersForExport,
	getOrderExportFilters,
	ordersToCsv,
} from "../src/lib/orders-export";

const filters = getOrderExportFilters(
	" current search ",
	"?search=stale&status=SUBMITTED&goodsId=3&customerId=8&movementTypeId=move-1&startDate=2026-01-01&endDate=2026-02-01&sortBy=orderDate&sortOrder=asc&page=7&limit=20",
);
assert.deepEqual(filters, {
	search: "current search",
	status: "SUBMITTED",
	goodsId: 3,
	customerId: 8,
	movementTypeId: "move-1",
	startDate: "2026-01-01",
	endDate: "2026-02-01",
	sortBy: "orderDate",
	sortOrder: "asc",
});

const order = (id: number): OrderListDto => ({
	id,
	createdAt: "2026-02-02T10:00:00.000Z",
	orderNumber: `ORD-${String(id).padStart(10, "A")}`,
	quantityDemanded: "10",
	quantityAchieved: null,
	orderDate: "2026-02-01T00:00:00.000Z",
	startDate: null,
	endDate: null,
	orderStatus: { id: "submitted", name: "SUBMITTED" },
	unit: { name: "Tonnes" },
	customer: { id: 8, companyName: '=ACME,"North"' },
	good: { id: 3, name: "Grain" },
	createdByUser: { id: 12, firstName: "Sam", lastName: "Agent" },
});

const requestedPages: OrdersControllerFindAllParams[] = [];
const pages = await fetchAllOrdersForExport(filters, async (params) => {
	requestedPages.push(params);
	if (params.page === 1) return Array.from({ length: 100 }, (_, i) => order(i));
	return [order(100)];
});
assert.equal(pages.length, 101);
assert.deepEqual(
	requestedPages.map(({ page, limit, status, search }) => ({
		page,
		limit,
		status,
		search,
	})),
	[
		{ page: 1, limit: 100, status: "SUBMITTED", search: "current search" },
		{ page: 2, limit: 100, status: "SUBMITTED", search: "current search" },
	],
);

const csv = ordersToCsv(
	[order(1)],
	{
		orderNumber: "Order #",
		customer: "Customer",
		good: "Good",
		quantityDemanded: "Quantity demanded",
		quantityAchieved: "Quantity achieved",
		unit: "Unit",
		status: "Status",
		orderDate: "Order date",
		startDate: "Start date",
		endDate: "End date",
		createdBy: "Created by",
	},
	() => "Submitted",
	(date) => date ?? "",
);
assert.ok(csv.startsWith('\uFEFF"Order #"'));
assert.match(csv, /"'=ACME/);
assert.match(csv, /"Submitted"/);
assert.match(csv, /"Sam Agent"/);

console.log("Orders CSV export checks passed.");
