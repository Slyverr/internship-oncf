import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.dashboard.pageTitle),
		description: t(Messages.dashboard.metadataDescription),
	};
}

export default function Page() {
	return <DashboardHome />;
}
