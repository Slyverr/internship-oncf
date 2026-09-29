import { RecordDetail } from "@/components/common/record-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";
import { formatEnumLabel } from "@/lib/enum-labels";

export function ClaimOverview({ claim }: { claim: ClaimDetailDto }) {
	const createdBy = claim.createdByUser
		? `${claim.createdByUser.firstName} ${claim.createdByUser.lastName}`
		: "—";

	const closedBy = claim.closedByUser
		? `${claim.closedByUser.firstName} ${claim.closedByUser.lastName}`
		: "—";

	return (
		<div className="space-y-6">
			{/* Existing grid of cards */}
			<div className="grid gap-4 @3xl/workspace:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Claim Information</CardTitle>
					</CardHeader>

					<CardContent className="space-y-4">
						<RecordDetail label="Claim number" value={claim.claimNumber} />
						<RecordDetail
							label="Customer"
							value={claim.customer?.companyName ?? "—"}
						/>
						<RecordDetail
							label="Type"
							value={formatEnumLabel(claim.claimType?.name)}
						/>
						<RecordDetail
							label="Status"
							value={formatEnumLabel(claim.claimStatus?.name)}
						/>
						<RecordDetail
							label="Priority"
							value={formatEnumLabel(claim.priority)}
						/>
						<RecordDetail label="Created By" value={createdBy} />
						<RecordDetail
							label="Created Date"
							value={formatDisplayDate(claim.createdAt)}
						/>
						<RecordDetail
							label="Last Updated"
							value={formatDisplayDate(claim.updatedAt)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Associations & Scope</CardTitle>
					</CardHeader>

					<CardContent className="space-y-4">
						<RecordDetail
							label="Associated Order"
							value={claim.order ? `#${claim.order.orderNumber}` : "—"}
						/>
						<RecordDetail
							label="Accessory Operation"
							value={claim.accessoryOperation?.name ?? "—"}
						/>
						<RecordDetail label="Description" value={claim.description} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Status History</CardTitle>
					</CardHeader>

					<CardContent>
						<RecordDetail
							label="Recorded changes"
							value={String(claim.claimStatusHistories?.length ?? 0)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Resolution & Closure</CardTitle>
					</CardHeader>

					<CardContent className="space-y-4">
						<RecordDetail
							label="Resolution Summary"
							value={claim.resolution ?? "—"}
						/>
						<RecordDetail label="Closed By" value={closedBy} />
						<RecordDetail
							label="Closed Date"
							value={formatDisplayDate(claim.closedAt)}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
