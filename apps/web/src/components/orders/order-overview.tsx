import { RecordDetail, RecordMetric } from "@/components/common/record-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";
import { formatEnumLabel } from "@/lib/enum-labels";
import { OrderAttachments } from "./order-attachments";

export function OrderOverview({ order }: { order: OrderDetailDto }) {
	return (
		<div className="flex flex-col gap-8">
			<div className="grid gap-4 @3xl/workspace:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Order Information</CardTitle>
					</CardHeader>

					<CardContent className="flex flex-col gap-4">
						<RecordDetail
							label="Order Number"
							value={order.orderNumber ?? "—"}
						/>

						<RecordDetail label="Customer" value={order.customer.companyName} />

						<RecordDetail
							label="Status"
							value={formatEnumLabel(order.orderStatus.name)}
						/>

						<RecordDetail label="Supervisor" value={order.supervisor ?? "—"} />

						<RecordDetail
							label="Quantity Demanded"
							value={`${order.quantityDemanded} ${order.unit.name}`}
						/>

						<RecordDetail
							label="Quantity Achieved"
							value={
								order.quantityAchieved
									? `${order.quantityAchieved} ${order.unit.name}`
									: "—"
							}
						/>

						<RecordDetail
							label="Order Date"
							value={formatDisplayDate(order.orderDate)}
						/>

						<RecordDetail
							label="Created"
							value={formatDisplayDate(order.createdAt)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Transport</CardTitle>
					</CardHeader>

					<CardContent className="flex flex-col gap-4">
						<RecordDetail label="Good" value={order.good.name} />

						<RecordDetail
							label="Departure Station"
							value={order.departureStationId?.toString() ?? "—"}
						/>

						<RecordDetail
							label="Arrival Station"
							value={order.arrivalStationId?.toString() ?? "—"}
						/>

						<RecordDetail
							label="Pickup Port"
							value={order.pickupPortId?.toString() ?? "—"}
						/>

						<RecordDetail
							label="Delivery Port"
							value={order.deliveryPortId?.toString() ?? "—"}
						/>

						<RecordDetail label="Remarks" value={order.remarks ?? "—"} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Execution</CardTitle>
					</CardHeader>

					<CardContent className="grid gap-4 sm:grid-cols-2">
						<RecordMetric
							label="Forecast Programs"
							value={order.forecastPrograms.length}
						/>

						<RecordMetric
							label="Executions"
							value={order.orderExecutions.length}
						/>

						<RecordMetric label="Claims" value={order.claims.length} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Dates</CardTitle>
					</CardHeader>

					<CardContent className="flex flex-col gap-4">
						<RecordDetail
							label="Start Date"
							value={formatDisplayDate(order.startDate)}
						/>

						<RecordDetail
							label="End Date"
							value={formatDisplayDate(order.endDate)}
						/>

						<RecordDetail
							label="Updated"
							value={formatDisplayDate(order.updatedAt)}
						/>
					</CardContent>
				</Card>
			</div>

			<OrderAttachments orderId={order.id} />
		</div>
	);
}
