import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ProgramCreateForm } from "@/components/programs/program-create-form";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { programsBreadcrumbs } from "../breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.programs.createTitle),
		description: t(Messages.programs.createDescription),
	};
}

type PageProps = {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
	const t = await getRequestTranslator();
	const params = await searchParams;
	const orderNumberValue = params.orderNumber;
	const searchValue = params.search;

	return (
		<>
			<Breadcrumbs items={programsBreadcrumbs.create(t)} />
			<ProgramCreateForm
				initialOrderNumber={
					typeof orderNumberValue === "string" ? orderNumberValue : undefined
				}
				initialOrderSearch={
					typeof searchValue === "string" ? searchValue : undefined
				}
			/>
		</>
	);
}
