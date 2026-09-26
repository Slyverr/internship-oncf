import { customFetch } from "@/lib/axios";

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

export function getOrderReport(params: { from?: string; to?: string }) {
	return customFetch<OrderReport>({
		url: "/reports/orders",
		method: "GET",
		params,
	});
}
