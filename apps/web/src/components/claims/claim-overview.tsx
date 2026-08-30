import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";

export function ClaimOverview({ claim }: { claim: ClaimDetailDto }) {
	const createdBy = claim.createdByUser
		? `${claim.createdByUser.firstName} ${claim.createdByUser.lastName}`
		: "—";

	const closedBy = claim.closedByUser
		? `${claim.closedByUser.firstName} ${claim.closedByUser.lastName}`
		: "—";

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Claim Information</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<Detail label="Claim ID" value={`#${claim.id}`} />
					<Detail label="Customer" value={claim.customer?.companyName ?? "—"} />
					<Detail label="Type" value={claim.claimType?.name ?? "—"} />
					<Detail label="Status" value={claim.claimStatus?.name ?? "—"} />
					<Detail
						label="Priority"
						value={claim.priority ? claim.priority.toUpperCase() : "—"}
					/>
					<Detail label="Created By" value={createdBy} />
					<Detail label="Created Date" value={formatDate(claim.createdAt)} />
					<Detail label="Last Updated" value={formatDate(claim.updatedAt)} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Associations & Scope</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<Detail
						label="Associated Order"
						value={claim.order ? `#${claim.order.orderNumber}` : "—"}
					/>
					<Detail
						label="Accessory Operation"
						value={claim.accessoryOperation?.name ?? "—"}
					/>
					<Detail label="Description" value={claim.description} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Activity & Metrics</CardTitle>
				</CardHeader>

				<CardContent className="grid gap-4 sm:grid-cols-2">
					<Metric label="Comments" value={claim.claimComments?.length ?? 0} />
					<Metric
						label="Status Changes"
						value={claim.claimStatusHistories?.length ?? 0}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Resolution & Closure</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<Detail label="Resolution Summary" value={claim.resolution ?? "—"} />
					<Detail label="Closed By" value={closedBy} />
					<Detail label="Closed Date" value={formatDate(claim.closedAt)} />
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
