import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { TrackingWorkspace } from "@/components/tracking/tracking-workspace";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return { title: t(Messages.tracking.pageTitle) };
}

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ order?: string }>;
}) {
	const t = await getRequestTranslator();
	const { order } = await searchParams;
	return (
		<>
			<Breadcrumbs items={[{ label: t(Messages.tracking.pageTitle) }]} />
			<PageHeader
				title={t(Messages.tracking.pageTitle)}
				description={t(Messages.tracking.pageDescription)}
			/>
			<TrackingWorkspace initialOrderNumber={order ?? ""} />
		</>
	);
}
