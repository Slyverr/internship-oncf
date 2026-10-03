import { customFetch } from "@/lib/axios";
import { csvRowsToText } from "@/lib/csv";

export interface ReportCount {
	id: number | string;
	name: string;
	count: number;
}

export interface OrderReport {
	from: string | null;
	to: string | null;
	totalOrders: number;
	byStatus: ReportCount[];
	byCustomer: ReportCount[];
	byProduct: ReportCount[];
	byMonth: { month: string; count: number }[];
}

export interface OrderReportCsvLabels {
	section: string;
	name: string;
	orders: string;
	byStatus: string;
	byCustomer: string;
	byProduct: string;
	byMonth: string;
}

export function orderReportToCsv(
	report: OrderReport,
	labels: OrderReportCsvLabels,
): string {
	const row = (section: string, name: string, count: number) =>
		[section, name, count] as [string, string, number];
	const rows: Array<[string, string, number]> = [
		...report.byStatus.map(({ name, count }) =>
			row(labels.byStatus, name, count),
		),
		...report.byCustomer.map(({ name, count }) =>
			row(labels.byCustomer, name, count),
		),
		...report.byProduct.map(({ name, count }) =>
			row(labels.byProduct, name, count),
		),
		...report.byMonth.map(({ month, count }) =>
			row(labels.byMonth, month, count),
		),
	];

	return csvRowsToText([[labels.section, labels.name, labels.orders], ...rows]);
}

export function hasInvalidOrderReportDateRange(from: string, to: string) {
	return Boolean(from && to && from > to);
}

export function getOrderReport(params: { from?: string; to?: string }) {
	return customFetch<OrderReport>({
		url: "/reports/orders",
		method: "GET",
		params,
	});
}
