import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";

export function OrderOverview({ order }: { order: OrderDetailDto }) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Order Information</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
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

				<CardContent className="space-y-4">
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
					<Metric label="Files" value={order.orderFiles.length} />
					<Metric label="Claims" value={order.claims.length} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Dates</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
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
		<div className="flex items-start justify-between gap-4">
			<span className="text-sm text-muted-foreground">{label}</span>
			<span className="text-right text-sm font-medium">{value}</span>
		</div>
	);
}

function Metric({ label, value }: { label: string; value: number }) {
	return (
		<div className="space-y-1">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="text-2xl font-semibold">{value}</p>
		</div>
	);
}

function formatDate(date?: string | null) {
	return date ? new Date(date).toLocaleDateString() : "—";
}
