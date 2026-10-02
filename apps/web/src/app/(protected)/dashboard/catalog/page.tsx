import type { Metadata } from "next";
import { ReferenceDataPage } from "@/components/catalog/reference-data-page";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.referenceData.pageTitle),
	};
}

export default async function Page() {
	const t = await getRequestTranslator();
	return (
		<>
			<Breadcrumbs items={[{ label: t(Messages.referenceData.pageTitle) }]} />
			<ReferenceDataPage />
		</>
	);
}
