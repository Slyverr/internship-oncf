"use client";

import { ClaimActions } from "@/components/claims/claim-actions";
import { ClaimConversation } from "@/components/claims/claim-conversation";
import { ClaimOverview } from "@/components/claims/claim-overview";
import { PageHeader } from "@/components/common/page-header";
import { useClaimsControllerFindOne } from "@/lib/api/claims";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";

interface ClaimDetailsClientProps {
	claim: ClaimDetailDto;
}

export function ClaimDetailsClient({ claim }: ClaimDetailsClientProps) {
	const { data: currentClaim } = useClaimsControllerFindOne(claim.claimNumber, {
		query: {
			initialData: claim,
		},
	});

	if (!currentClaim) {
		return null;
	}

	return (
		<>
			<PageHeader
				title={currentClaim.claimNumber}
				description={currentClaim.customer.companyName}
			>
				<ClaimConversation
					claimId={currentClaim.id}
					claimNumber={currentClaim.claimNumber}
					commentCount={currentClaim.claimComments?.length ?? 0}
				/>
				<ClaimActions claim={currentClaim} />
			</PageHeader>

			<ClaimOverview claim={currentClaim} />
		</>
	);
}
