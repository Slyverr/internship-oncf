import { ClaimsPageHeader } from "@/components/claims/claims-page-header";
import { ClaimsTable } from "@/components/claims/claims-table";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { claimsControllerFindAll } from "@/lib/api/claims";
import { ClaimsControllerFindAllParams } from "@/lib/api/generated.schemas";
import { claimsBreadcrumbs } from "./breadcrumbs";

interface PageProps {
	searchParams: Promise<ClaimsControllerFindAllParams>;
}

export default async function Page({ searchParams }: PageProps) {
	const query = await searchParams;
	const claims = await claimsControllerFindAll(query);

	return (
		<>
			<Breadcrumbs items={claimsBreadcrumbs.home()} />

			<ClaimsPageHeader />

			<ClaimsTable data={claims} />
		</>
	);
}
