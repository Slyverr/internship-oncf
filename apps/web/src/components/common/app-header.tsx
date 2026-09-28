"use client";

import { BreadcrumbTrail } from "@/components/common/breadcrumb-trail";
import { WorkspaceLayoutSwitch } from "@/components/common/workspace-layout-switch";
import { NotificationLink } from "@/components/notifications/notification-link";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useBreadcrumbs } from "@/providers/breadcrumb-provider";

export function AppHeader() {
	const { breadcrumbs } = useBreadcrumbs();

	return (
		<header className="flex h-16 items-center gap-4 border-b px-4">
			<SidebarTrigger />

			{breadcrumbs.length > 0 && (
				<>
					<div className="flex h-8">
						<Separator orientation="vertical" />
					</div>

					<BreadcrumbTrail items={breadcrumbs} className="flex-1" />
				</>
			)}
			<div className="ml-auto flex items-center gap-1">
				<WorkspaceLayoutSwitch />
				<NotificationLink />
			</div>
		</header>
	);
}
