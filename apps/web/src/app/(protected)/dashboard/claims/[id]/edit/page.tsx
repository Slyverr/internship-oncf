import { ClaimEditForm } from "@/components/claims/claim-edit-form";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { claimsControllerFindOne } from "@/lib/api/claims";
import { claimsBreadcrumbs } from "../../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const claim = await claimsControllerFindOne(id);

	return (
		<>
			<Breadcrumbs items={claimsBreadcrumbs.edit(id, claim.claimNumber)} />

			<ClaimEditForm claim={claim} />
		</>
	);
}
