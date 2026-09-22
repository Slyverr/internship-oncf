import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import { OrderAttachments } from "./order-attachments";

export function OrderOverview({ order }: { order: OrderDetailDto }) {
	return (
		<div className="flex flex-col gap-8">
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Order Information</CardTitle>
					</CardHeader>

					<CardContent className="flex flex-col gap-4">
						<Detail label="Order Number" value={order.orderNumber ?? "—"} />

						<Detail label="Customer" value={order.customer.companyName} />

						<Detail label="Status" value={order.orderStatus.name} />

						<Detail label="Supervisor" value={order.supervisor ?? "—"} />

						<Detail
							label="Quantity Demanded"
							value={`${order.quantityDemanded} ${order.unit.name}`}
						/>

						<Detail
							label="Quantity Achieved"
							value={
								order.quantityAchieved
									? `${order.quantityAchieved} ${order.unit.name}`
									: "—"
							}
						/>

						<Detail label="Order Date" value={formatDate(order.orderDate)} />

						<Detail label="Created" value={formatDate(order.createdAt)} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Transport</CardTitle>
					</CardHeader>

					<CardContent className="flex flex-col gap-4">
						<Detail label="Good" value={order.good.name} />

						<Detail
							label="Departure Station"
							value={order.departureStationId?.toString() ?? "—"}
						/>

						<Detail
							label="Arrival Station"
							value={order.arrivalStationId?.toString() ?? "—"}
						/>

						<Detail
							label="Pickup Port"
							value={order.pickupPortId?.toString() ?? "—"}
						/>

						<Detail
							label="Delivery Port"
							value={order.deliveryPortId?.toString() ?? "—"}
						/>

						<Detail label="Remarks" value={order.remarks ?? "—"} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Execution</CardTitle>
					</CardHeader>

					<CardContent className="grid gap-4 sm:grid-cols-2">
						<Metric
							label="Forecast Programs"
							value={order.forecastPrograms.length}
						/>

						<Metric label="Executions" value={order.orderExecutions.length} />

						<Metric label="Claims" value={order.claims.length} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Dates</CardTitle>
					</CardHeader>

					<CardContent className="flex flex-col gap-4">
						<Detail label="Start Date" value={formatDate(order.startDate)} />

						<Detail label="End Date" value={formatDate(order.endDate)} />

						<Detail label="Updated" value={formatDate(order.updatedAt)} />
					</CardContent>
				</Card>
			</div>

			<OrderAttachments orderId={order.id} />
		</div>
	);
}

function formatDate(value: string | null) {
	if (!value) {
		return "—";
	}

	return new Date(value).toLocaleDateString();
}

function Detail({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-4">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="text-right text-sm font-medium">{value}</p>
		</div>
	);
}

function Metric({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex flex-col gap-4 rounded-md bg-muted p-4">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="text-xl font-semibold">{value}</p>
		</div>
	);
}
