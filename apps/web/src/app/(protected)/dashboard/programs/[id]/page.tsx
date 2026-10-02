import type { Metadata } from "next";
import { AccessDeniedState } from "@/components/common/access-denied-state";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ProgramDetailsClient } from "@/components/programs/program-details-client";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { programsControllerFindOne } from "@/lib/api/programs";
import { loadPageData } from "@/lib/load-page-data";
import { programsBreadcrumbs } from "../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const t = await getRequestTranslator();
	const { id } = await params;
	return {
		title: t(Messages.programs.detail.title, { recordCode: id }),
	};
}

export default async function Page({ params }: PageProps) {
	const t = await getRequestTranslator();
	const { id } = await params;
	const program = await loadPageData(programsControllerFindOne(id));
	if (!program) {
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
			<Breadcrumbs
				items={programsBreadcrumbs.detail(id, program.programNumber, t)}
			/>

			<ProgramDetailsClient program={program} />
		</>
	);
}
