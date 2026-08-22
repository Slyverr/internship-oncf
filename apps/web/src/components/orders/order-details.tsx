import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderDetailDto } from "@/lib/api/generated.schemas";

export function OrderDetails({ order }: { order: OrderDetailDto }) {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Order Information</CardTitle>
				</CardHeader>

				<CardContent className="space-y-3">
					<Detail label="Order Number" value={order.orderNumber ?? "-"} />

					<Detail label="Customer" value={order.customer?.companyName ?? "-"} />

					<Detail label="Status" value={order.orderStatus?.name ?? "-"} />

					<Detail label="Supervisor" value={order.supervisor ?? "-"} />

					<Detail
						label="Quantity Demanded"
						value={`${order.quantityDemanded} ${order.unit?.name ?? ""}`}
					/>

					<Detail
						label="Quantity Achieved"
						value={
							order.quantityAchieved
								? `${order.quantityAchieved} ${order.unit?.name ?? ""}`
								: "-"
						}
					/>

					<Detail label="Created" value={formatDate(order.createdAt)} />

					<Detail label="Order Date" value={formatDate(order.orderDate)} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Transport</CardTitle>
				</CardHeader>

				<CardContent className="space-y-3">
					<Detail label="Goods" value={order.good?.name ?? "-"} />

					<Detail
						label="Departure Station"
						value={String(order.departureStationId ?? "-")}
					/>

					<Detail
						label="Arrival Station"
						value={String(order.arrivalStationId ?? "-")}
					/>

					<Detail
						label="Pickup Port"
						value={String(order.pickupPortId ?? "-")}
					/>

					<Detail
						label="Delivery Port"
						value={String(order.deliveryPortId ?? "-")}
					/>

					<Detail label="Remarks" value={order.remarks ?? "-"} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Execution</CardTitle>
				</CardHeader>

				<CardContent className="space-y-3">
					<Detail
						label="Forecast Programs"
						value={String(order.forecastPrograms.length)}
					/>

					<Detail
						label="Executions"
						value={String(order.orderExecutions.length)}
					/>

					<Detail label="Files" value={String(order.orderFiles.length)} />

					<Detail label="Claims" value={String(order.claims.length)} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Dates</CardTitle>
				</CardHeader>

				<CardContent className="space-y-3">
					<Detail label="Start Date" value={formatDate(order.startDate)} />

					<Detail label="End Date" value={formatDate(order.endDate)} />

					<Detail label="Updated" value={formatDate(order.updatedAt)} />
				</CardContent>
			</Card>
		</div>
	);
}

function Detail({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex justify-between gap-4">
			<span className="text-muted-foreground">{label}</span>

			<span className="font-medium text-right">{value}</span>
		</div>
	);
}

function formatDate(date?: string | null) {
	if (!date) return "-";

	return new Date(date).toLocaleDateString();
}
