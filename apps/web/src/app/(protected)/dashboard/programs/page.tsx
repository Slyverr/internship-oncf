import { PlusIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { AccessDeniedState } from "@/components/common/access-denied-state";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { ProgramsTable } from "@/components/programs/programs-table";
import { buttonVariants } from "@/components/ui/button";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { programsControllerFindAll } from "@/lib/api/programs";
import { loadPageData } from "@/lib/load-page-data";
import { programsBreadcrumbs } from "./breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.programs.pageTitle),
		description: t(Messages.programs.metadataDescription),
	};
}

export default async function Page() {
	const t = await getRequestTranslator();
	const programs = await loadPageData(programsControllerFindAll({}));
	if (!programs) {
		return (
			<AccessDeniedState
				title={t(Messages.programs.pageTitle)}
				description={t(Messages.apiError.accessDenied)}
				breadcrumbs={programsBreadcrumbs.home(t)}
			/>
		);
	}

	return (
		<>
			<Breadcrumbs items={programsBreadcrumbs.home(t)} />

			<PageHeader
				title={t(Messages.programs.pageTitle)}
				description={t(Messages.programs.pageDescription)}
			>
				<Link className={buttonVariants()} href="/dashboard/programs/new">
					<PlusIcon />
					{t(Messages.programs.create)}
				</Link>
			</PageHeader>

			<ProgramsTable data={programs} />
		</>
	);
}
