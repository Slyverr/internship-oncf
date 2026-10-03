import type { Metadata } from "next";
import { ClaimsPageHeader } from "@/components/claims/claims-page-header";
import { ClaimsTable } from "@/components/claims/claims-table";
import { AccessDeniedState } from "@/components/common/access-denied-state";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { claimsControllerFindAll } from "@/lib/api/claims";
import { ClaimsControllerFindAllParams } from "@/lib/api/generated.schemas";
import { loadPageData } from "@/lib/load-page-data";
import { claimsBreadcrumbs } from "./breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return { title: t(Messages.claims.title) };
}

interface PageProps {
	searchParams: Promise<ClaimsControllerFindAllParams>;
}

export default async function Page({ searchParams }: PageProps) {
	const t = await getRequestTranslator();
	const query = await searchParams;
	const claims = await loadPageData(claimsControllerFindAll(query));
	if (!claims) {
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
			<Breadcrumbs items={claimsBreadcrumbs.home(t)} />

			<ClaimsPageHeader />

			<ClaimsTable
				data={claims}
				sortBy={typeof query.sortBy === "string" ? query.sortBy : undefined}
				sortOrder={query.sortOrder}
			/>
		</>
	);
}
