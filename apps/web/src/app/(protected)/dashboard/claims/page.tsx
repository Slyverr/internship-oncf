import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { ClaimsTable } from "@/components/claims/claims-table";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { buttonVariants } from "@/components/ui/button";
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

			<PageHeader title="Claims" description="Manage and edit claims.">
				<Link className={buttonVariants()} href="/dashboard/claims/new">
					<PlusIcon />
					Create Claim
				</Link>
			</PageHeader>

			<ClaimsTable data={claims} />
		</>
	);
}
