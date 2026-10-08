import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { DtmActivityPage } from "@/components/integrations/dtm-activity-page";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return { title: t(Messages.dtmActivity.pageTitle) };
}

export default async function Page() {
	const t = await getRequestTranslator();
	return (
		<>
			<Breadcrumbs
				items={[
					{
						label: t(Messages.navigation.integrations),
						href: "/dashboard/integrations",
					},
					{ label: t(Messages.dtmActivity.pageTitle) },
				]}
			/>
			<DtmActivityPage />
		</>
	);
}
