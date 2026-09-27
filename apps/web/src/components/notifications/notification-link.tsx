"use client";

import { Popover } from "@base-ui/react/popover";
import { useQueryClient } from "@tanstack/react-query";
import { BellIcon, CheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { NotificationListDto } from "@/lib/api/generated.schemas";
import {
	useNotificationsControllerFindAll,
	useNotificationsControllerGetUnreadCount,
	useNotificationsControllerMarkAllAsRead,
	useNotificationsControllerMarkAsRead,
} from "@/lib/api/notifications";
import { formatDisplayDateTime } from "@/lib/date-utils";

function entityLink(notification: NotificationListDto) {
	const routes: Record<string, string> = {
		orders: "orders",
		order: "orders",
		programs: "programs",
		program: "programs",
		claims: "claims",
		claim: "claims",
	};
	const route = routes[notification.relatedEntityType ?? ""];
	return route && notification.relatedEntityId
		? `/dashboard/${route}/${notification.relatedEntityId}`
		: null;
}

export function NotificationLink() {
	const [open, setOpen] = useState(false);
	const client = useQueryClient();
	const unreadQuery = useNotificationsControllerGetUnreadCount({
		query: { refetchInterval: 30000 },
	});
	const listQuery = useNotificationsControllerFindAll({
		query: { enabled: open, refetchInterval: open ? 30000 : false },
	});
	const markRead = useNotificationsControllerMarkAsRead();
	const markAll = useNotificationsControllerMarkAllAsRead();
	const count = unreadQuery.data?.count ?? 0;
	const notifications = (listQuery.data ?? []).slice(0, 5);
	const pending = markRead.isPending || markAll.isPending;

	async function markNotificationRead(id?: number) {
		try {
			if (id === undefined) await markAll.mutateAsync();
			else await markRead.mutateAsync({ id });
			await Promise.all([
				client.invalidateQueries({ queryKey: ["/notifications"] }),
				client.invalidateQueries({ queryKey: ["/notifications/unread-count"] }),
			]);
		} catch {
			toast.add({
				type: "error",
				title: "Could not update notifications",
				description: "Please try again.",
			});
		}
	}

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger
				className="relative ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-md hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				aria-label={`Notifications${count ? `, ${count} unread` : ""}`}
			>
				<BellIcon className="size-5" aria-hidden="true" />
				{count > 0 && (
					<span className="absolute right-0 top-0 flex h-5 min-w-5 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
						{count > 99 ? "99+" : count}
					</span>
				)}
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Positioner
					side="bottom"
					align="end"
					sideOffset={8}
					className="z-50 outline-none"
				>
					<Popover.Popup
						aria-label="Notifications"
						className="flex max-h-[70vh] w-[min(22.5rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
					>
						<div className="flex min-h-16 items-center justify-between gap-4 border-b border-border px-4 py-3">
							<div className="min-w-0">
								<h2 className="text-base font-semibold leading-6">
									Notifications
								</h2>
								<p className="text-sm text-muted-foreground">
									{count === 0 ? "You’re all caught up" : `${count} unread`}
								</p>
							</div>
							<Button
								variant="outline"
								size="sm"
								disabled={pending || count === 0}
								onClick={() => void markNotificationRead()}
							>
								Mark all read
							</Button>
						</div>
						<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
							{listQuery.isLoading ? (
								<p
									className="px-4 py-8 text-center text-sm text-muted-foreground"
									role="status"
								>
									Loading notifications…
								</p>
							) : listQuery.isError ? (
								<div className="space-y-3 px-4 py-6 text-center" role="alert">
									<p className="text-sm">Could not load notifications.</p>
									<Button
										variant="outline"
										size="sm"
										onClick={() => void listQuery.refetch()}
									>
										Try again
									</Button>
								</div>
							) : notifications.length === 0 ? (
								<p className="px-4 py-8 text-center text-sm text-muted-foreground">
									No notifications yet.
								</p>
							) : (
								<ul>
									{notifications.map((item) => {
										const href = entityLink(item);
										const content = (
											<>
												{!item.readAt && (
													<span
														className="mt-2 size-2 shrink-0 rounded-full bg-primary"
														aria-label="Unread"
														role="img"
													/>
												)}
												<span className="min-w-0 flex-1 py-3">
													<span className="block truncate text-sm font-semibold leading-5">
														{item.title}
													</span>
													<span className="mt-1 line-clamp-2 block text-meta text-muted-foreground">
														{item.message}
													</span>
													<time
														className="mt-1 block text-meta text-muted-foreground"
														dateTime={item.createdAt}
													>
														{formatDisplayDateTime(item.createdAt)}
													</time>
												</span>
											</>
										);
										return (
											<li
												key={item.id}
												className="flex min-h-16 items-center gap-2 border-b border-border px-3 last:border-b-0"
											>
												{href ? (
													<Link
														href={href}
														onClick={() => {
															setOpen(false);
															if (!item.readAt)
																void markNotificationRead(item.id);
														}}
														className="flex min-w-0 flex-1 items-start gap-3 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
													>
														{content}
													</Link>
												) : (
													<div className="flex min-w-0 flex-1 items-start gap-3">
														{content}
													</div>
												)}
												{!item.readAt && (
													<button
														type="button"
														className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
														aria-label="Mark notification as read"
														disabled={pending}
														onClick={() => void markNotificationRead(item.id)}
													>
														<CheckIcon className="size-4" aria-hidden="true" />
													</button>
												)}
											</li>
										);
									})}
								</ul>
							)}
						</div>
						<div className="border-t border-border p-3">
							<Button
								variant="ghost"
								nativeButton={false}
								className="min-h-11 w-full"
								render={
									<Link
										href="/dashboard/notifications"
										onClick={() => setOpen(false)}
									/>
								}
							>
								View all notifications
							</Button>
						</div>
					</Popover.Popup>
				</Popover.Positioner>
			</Popover.Portal>
		</Popover.Root>
	);
}
