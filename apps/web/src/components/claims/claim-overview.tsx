import { RecordDetail } from "@/components/common/record-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Messages } from "@/i18n";
import {
	getClaimPriorityLabel,
	getClaimStatusLabel,
	getClaimTypeLabel,
} from "@/i18n/claim-labels";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";

export function ClaimOverview({ claim }: { claim: ClaimDetailDto }) {
	const locale = useLocale();
	const t = useTranslate();
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
						<CardTitle>{t(Messages.claims.detail.information)}</CardTitle>
					</CardHeader>

					<CardContent className="space-y-4">
						<RecordDetail
							label={t(Messages.claims.detail.claimCode)}
							value={claim.claimNumber}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.customer)}
							value={claim.customer?.companyName ?? "—"}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.type)}
							value={getClaimTypeLabel(claim.claimType?.name ?? "", locale)}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.status)}
							value={getClaimStatusLabel(claim.claimStatus?.name ?? "", locale)}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.priority)}
							value={
								claim.priority
									? getClaimPriorityLabel(claim.priority, locale)
									: "—"
							}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.createdBy)}
							value={createdBy}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.createdDate)}
							value={formatDisplayDate(claim.createdAt, locale)}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.lastUpdated)}
							value={formatDisplayDate(claim.updatedAt, locale)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t(Messages.claims.detail.associations)}</CardTitle>
					</CardHeader>

					<CardContent className="space-y-4">
						<RecordDetail
							label={t(Messages.claims.detail.associatedOrder)}
							value={claim.order ? `#${claim.order.orderNumber}` : "—"}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.accessoryOperation)}
							value={claim.accessoryOperation?.name ?? "—"}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.description)}
							value={claim.description}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t(Messages.claims.detail.statusHistory)}</CardTitle>
					</CardHeader>

					<CardContent>
						<RecordDetail
							label={t(Messages.claims.detail.recordedChanges)}
							value={String(claim.claimStatusHistories?.length ?? 0)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t(Messages.claims.detail.resolutionClosure)}</CardTitle>
					</CardHeader>

					<CardContent className="space-y-4">
						<RecordDetail
							label={t(Messages.claims.detail.resolutionSummary)}
							value={claim.resolution ?? "—"}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.closedBy)}
							value={closedBy}
						/>
						<RecordDetail
							label={t(Messages.claims.detail.closedDate)}
							value={formatDisplayDate(claim.closedAt, locale)}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
