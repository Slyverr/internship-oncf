import type { Metadata } from "next";
import { ClaimDetailsClient } from "@/components/claims/claim-details-client";
import { AccessDeniedState } from "@/components/common/access-denied-state";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { claimsControllerFindOne } from "@/lib/api/claims";
import { loadPageData } from "@/lib/load-page-data";
import { claimsBreadcrumbs } from "../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const t = await getRequestTranslator();
	const { id } = await params;
	return { title: t(Messages.claims.detail.title, { recordCode: id }) };
}

export default async function Page({ params }: PageProps) {
	const t = await getRequestTranslator();
	const { id } = await params;
	const claim = await loadPageData(claimsControllerFindOne(id));
	if (!claim) {
		return (
			<AccessDeniedState
				title={t(Messages.claims.title)}
				description={t(Messages.apiError.accessDenied)}
				breadcrumbs={claimsBreadcrumbs.home(t)}
			/>
		);
	}

	return (
		<>
			<Breadcrumbs items={claimsBreadcrumbs.detail(id, claim.claimNumber, t)} />

			<ClaimDetailsClient claim={claim} />
		</>
	);
}
