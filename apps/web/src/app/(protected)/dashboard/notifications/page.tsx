import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { NotificationInbox } from "@/components/notifications/notification-inbox";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.notifications.title),
	};
}
export default async function Page() {
	const t = await getRequestTranslator();
	return (
		<>
			<Breadcrumbs items={[{ label: t(Messages.notifications.title) }]} />
			<PageHeader
				title={t(Messages.notifications.title)}
				description={t(Messages.notifications.pageDescription)}
			/>
			<NotificationInbox />
		</>
	);
}
