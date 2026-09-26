import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { NotificationInbox } from "@/components/notifications/notification-inbox";

export const metadata: Metadata = { title: "Notifications" };
export default function Page() {
	return (
		<>
			<Breadcrumbs items={[{ label: "Notifications" }]} />
			<PageHeader
				title="Notifications"
				description="Updates to your orders, programs, and claims."
			/>
			<NotificationInbox />
		</>
	);
}
