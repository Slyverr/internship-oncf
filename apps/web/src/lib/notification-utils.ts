import type { NotificationListDto } from "@/lib/api/generated.schemas";

const notificationRoutes: Record<string, string> = {
	orders: "orders",
	order: "orders",
	programs: "programs",
	program: "programs",
	forecast_programs: "programs",
	claims: "claims",
	claim: "claims",
};

export function getNotificationHref(
	notification: Pick<
		NotificationListDto,
		"relatedEntityType" | "messageParameters"
	>,
) {
	const route = notificationRoutes[notification.relatedEntityType ?? ""];
	const recordCode = notification.messageParameters.recordCode;
	return route && recordCode
		? `/dashboard/${route}/${encodeURIComponent(recordCode)}`
		: null;
}
