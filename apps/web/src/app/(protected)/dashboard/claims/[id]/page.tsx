import { ClaimDetailsClient } from "@/components/claims/claim-details-client";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { claimsControllerFindOne } from "@/lib/api/claims";
import { claimsBreadcrumbs } from "../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const claim = await claimsControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs items={claimsBreadcrumbs.detail(id, `#${claim.id}`)} />

			<ClaimDetailsClient claim={claim} />
		</>
	);
}
