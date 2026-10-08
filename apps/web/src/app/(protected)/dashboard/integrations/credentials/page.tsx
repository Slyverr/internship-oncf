import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { IntegrationCredentialsPage } from "@/components/integrations/integration-credentials-page";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return { title: t(Messages.integrationCredentials.pageTitle) };
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
					{ label: t(Messages.integrationCredentials.pageTitle) },
				]}
			/>
			<IntegrationCredentialsPage />
		</>
	);
}
