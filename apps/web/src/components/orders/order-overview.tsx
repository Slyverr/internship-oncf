import { RecordDetail, RecordMetric } from "@/components/common/record-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { getOrderStatusLabel } from "@/i18n/status-labels";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";
import { OrderAttachments } from "./order-attachments";

export function OrderOverview({ order }: { order: OrderDetailDto }) {
	const locale = useLocale();
	const t = useTranslate();
	const dtmStatusMessage =
		order.dtmRequestStatus === "PENDING"
			? Messages.orders.detail.dtm.pending
			: order.dtmResponseStatus === "ACCEPTED"
				? Messages.orders.detail.dtm.accepted
				: order.dtmResponseStatus === "REJECTED"
					? Messages.orders.detail.dtm.rejected
					: order.dtmRequestStatus === "TIMEOUT"
						? Messages.orders.detail.dtm.timedOut
						: order.dtmRequestStatus === "FAILED"
							? Messages.orders.detail.dtm.failed
							: order.dtmRequestStatus === "SUCCESS"
								? Messages.orders.detail.dtm.responseReceived
								: null;
	const dtmStatusVariant =
		order.dtmResponseStatus === "ACCEPTED"
			? "secondary"
			: order.dtmResponseStatus === "REJECTED" ||
					order.dtmRequestStatus === "FAILED" ||
					order.dtmRequestStatus === "TIMEOUT"
				? "destructive"
				: "outline";
	return (
		<div className="flex flex-col gap-8">
			<div className="grid gap-4 @3xl/workspace:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>{t(Messages.orders.detail.information)}</CardTitle>
					</CardHeader>

					<CardContent className="flex flex-col gap-4">
						<RecordDetail
							label={t(Messages.orders.detail.orderNumber)}
							value={order.orderNumber ?? "—"}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.customer)}
							value={order.customer.companyName}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.status)}
							value={getOrderStatusLabel(order.orderStatus.name, locale)}
						/>

						{dtmStatusMessage && (
							<RecordDetail
								label={t(Messages.orders.detail.dtm.status)}
								value={
									<Badge variant={dtmStatusVariant}>
										{t(dtmStatusMessage)}
									</Badge>
								}
							/>
						)}

						{order.dtmSubmittedAt && (
							<RecordDetail
								label={t(Messages.orders.detail.dtm.lastSubmitted)}
								value={formatDisplayDate(order.dtmSubmittedAt, locale)}
							/>
						)}

						<RecordDetail
							label={t(Messages.orders.detail.supervisor)}
							value={order.supervisor ?? "—"}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.quantityDemanded)}
							value={`${order.quantityDemanded} ${order.unit.name}`}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.quantityAchieved)}
							value={
								order.quantityAchieved
									? `${order.quantityAchieved} ${order.unit.name}`
									: "—"
							}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.orderDate)}
							value={formatDisplayDate(order.orderDate, locale)}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.created)}
							value={formatDisplayDate(order.createdAt, locale)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t(Messages.orders.detail.transport)}</CardTitle>
					</CardHeader>

					<CardContent className="flex flex-col gap-4">
						<RecordDetail
							label={t(Messages.orders.detail.good)}
							value={order.good.name}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.departureStation)}
							value={order.departureStationId?.toString() ?? "—"}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.arrivalStation)}
							value={order.arrivalStationId?.toString() ?? "—"}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.pickupPort)}
							value={order.pickupPortId?.toString() ?? "—"}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.deliveryPort)}
							value={order.deliveryPortId?.toString() ?? "—"}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.remarks)}
							value={order.remarks ?? "—"}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t(Messages.orders.detail.execution)}</CardTitle>
					</CardHeader>

					<CardContent className="grid gap-4 sm:grid-cols-2">
						<RecordMetric
							label={t(Messages.orders.detail.forecastPrograms)}
							value={order.forecastPrograms.length}
						/>

						<RecordMetric
							label={t(Messages.orders.detail.executions)}
							value={order.orderExecutions.length}
						/>

						<RecordMetric
							label={t(Messages.orders.detail.claims)}
							value={order.claims.length}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t(Messages.orders.detail.dates)}</CardTitle>
					</CardHeader>

					<CardContent className="flex flex-col gap-4">
						<RecordDetail
							label={t(Messages.orders.detail.startDate)}
							value={formatDisplayDate(order.startDate, locale)}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.endDate)}
							value={formatDisplayDate(order.endDate, locale)}
						/>

						<RecordDetail
							label={t(Messages.orders.detail.updated)}
							value={formatDisplayDate(order.updatedAt, locale)}
						/>
					</CardContent>
				</Card>
			</div>

			<OrderAttachments orderNumber={order.orderNumber} />
		</div>
	);
}
