import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OrderReportView } from "@/components/reports/order-report-view";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.reports.title),
	};
}

export default async function Page() {
	const t = await getRequestTranslator();
	return (
		<>
			<Breadcrumbs items={[{ label: t(Messages.reports.pageTitle) }]} />
			<OrderReportView />
		</>
	);
}
