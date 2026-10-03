import { OrderStatus } from "@ecommand/shared";
import type {
	OrderListDto,
	OrdersControllerFindAllParams,
} from "@/lib/api/generated.schemas";
import { ordersControllerFindAll } from "@/lib/api/orders";
import { csvRowsToText } from "@/lib/csv";

const EXPORT_PAGE_SIZE = 100;

export function getOrderExportFilters(
	search: string,
	queryString: string,
): Omit<OrdersControllerFindAllParams, "page" | "limit"> {
	const params = new URLSearchParams(queryString);
	const status = params.get("status");
	const sortOrder = params.get("sortOrder");
	const positiveNumber = (key: string) => {
		const value = Number(params.get(key));
		return Number.isSafeInteger(value) && value > 0 ? value : undefined;
	};

	return {
		search: search.trim() || undefined,
		status: Object.values(OrderStatus).includes(status as OrderStatus)
			? (status as OrderStatus)
			: undefined,
		goodsId: positiveNumber("goodsId"),
		customerId: positiveNumber("customerId"),
		movementTypeId: params.get("movementTypeId") || undefined,
		startDate: params.get("startDate") || undefined,
		endDate: params.get("endDate") || undefined,
		sortBy: params.get("sortBy") || undefined,
		sortOrder:
			sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined,
	};
}

export async function fetchAllOrdersForExport(
	filters: Omit<OrdersControllerFindAllParams, "page" | "limit">,
	fetchPage: (
		params: OrdersControllerFindAllParams,
	) => Promise<OrderListDto[]> = ordersControllerFindAll,
): Promise<OrderListDto[]> {
	const result: OrderListDto[] = [];
	let page = 1;

	while (true) {
		const rows = await fetchPage({
			...filters,
			page,
			limit: EXPORT_PAGE_SIZE,
		});
		result.push(...rows);
		if (rows.length < EXPORT_PAGE_SIZE) return result;
		page += 1;
	}
}

export interface OrdersCsvLabels {
	orderNumber: string;
	customer: string;
	good: string;
	quantityDemanded: string;
	quantityAchieved: string;
	unit: string;
	status: string;
	orderDate: string;
	startDate: string;
	endDate: string;
	createdBy: string;
}

export function ordersToCsv(
	orders: OrderListDto[],
	labels: OrdersCsvLabels,
	statusLabel: (status: string) => string,
	dateLabel: (date: string | null) => string,
): string {
	const rows = orders.map((order) => [
		order.orderNumber,
		order.customer?.companyName ?? "",
		order.good?.name ?? "",
		order.quantityDemanded,
		order.quantityAchieved ?? "",
		order.unit?.name ?? "",
		order.orderStatus ? statusLabel(order.orderStatus.name) : "",
		dateLabel(order.orderDate),
		dateLabel(order.startDate),
		dateLabel(order.endDate),
		order.createdByUser
			? `${order.createdByUser.firstName} ${order.createdByUser.lastName}`.trim()
			: "",
	]);
	return `\uFEFF${csvRowsToText([[...Object.values(labels)], ...rows])}`;
}
