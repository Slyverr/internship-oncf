"use client";

import { ClaimActions } from "@/components/claims/claim-actions";
import { ClaimOverview } from "@/components/claims/claim-overview";
import { PageHeader } from "@/components/common/page-header";
import { useClaimsControllerFindOne } from "@/lib/api/claims"; // Or your generated hook file location
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";

interface ClaimDetailsClientProps {
	claim: ClaimDetailDto;
}

export function ClaimDetailsClient({ claim }: ClaimDetailsClientProps) {
	const { data: currentClaim } = useClaimsControllerFindOne(claim.id, {
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
				title={`Claim #${currentClaim.id}`}
				description={currentClaim.customer.companyName}
			>
				<ClaimActions claim={currentClaim} />
			</PageHeader>

			<ClaimOverview claim={currentClaim} />
		</>
	);
}
