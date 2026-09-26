"use client";

import { BellIcon } from "lucide-react";
import Link from "next/link";
import { useNotificationsControllerGetUnreadCount } from "@/lib/api/notifications";

export function NotificationLink() {
	const { data } = useNotificationsControllerGetUnreadCount({
		query: { refetchInterval: 30000 },
	});
	const count = data?.count ?? 0;
	return (
		<Link
			href="/dashboard/notifications"
			className="relative ml-auto inline-flex items-center gap-compact rounded-md p-4 hover:bg-muted"
			aria-label={`Notifications${count ? `, ${count} unread` : ""}`}
		>
			<BellIcon className="size-5" />
			{count > 0 && (
				<span className="rounded-full bg-primary px-compact text-xs text-primary-foreground">
					{count > 99 ? "99+" : count}
				</span>
			)}
		</Link>
	);
}
