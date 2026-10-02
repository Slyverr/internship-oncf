import assert from "node:assert/strict";
import { orderReportToCsv } from "../src/lib/reports";

const csv = orderReportToCsv(
	{
		from: null,
		to: null,
		totalOrders: 2,
		byStatus: [{ id: "draft", name: 'Draft, "pending"', count: 2 }],
		byCustomer: [{ id: 1, name: '=HYPERLINK("bad")', count: 1 }],
		byProduct: [],
		byMonth: [{ month: "2026-09", count: 2 }],
	},
	{
		section: "Section",
		name: "Name",
		orders: "Orders",
		byStatus: "By status",
		byCustomer: "By customer",
		byProduct: "By product",
		byMonth: "By month",
	},
);

assert.equal(
	csv,
	'"Section","Name","Orders"\r\n"By status","Draft, ""pending""","2"\r\n"By customer","\'=HYPERLINK(""bad"")","1"\r\n"By month","2026-09","2"',
);

console.log("Report CSV export checks passed.");
