"use client";

import { useQueryClient } from "@tanstack/react-query";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import type { NotificationListDto } from "@/lib/api/generated.schemas";
import {
	useNotificationsControllerFindAll,
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

export function NotificationInbox() {
	const client = useQueryClient();
	const query = useNotificationsControllerFindAll({
		query: { refetchInterval: 30000 },
	});
	const markRead = useNotificationsControllerMarkAsRead();
	const markAll = useNotificationsControllerMarkAllAsRead();
	const [unreadOnly, setUnreadOnly] = useState(false);
	const notifications = query.data ?? [];
	const unread = notifications.filter((item) => !item.readAt);
	const visible = unreadOnly ? unread : notifications;
	const pending = markRead.isPending || markAll.isPending;

	async function read(id?: number) {
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
				title: "Could not mark notifications as read",
				description: "Please try again.",
			});
		}
	}

	if (query.isLoading) return <p role="status">Loading notifications…</p>;
	if (query.isError)
		return (
			<div role="alert" className="space-y-3">
				<p>Could not load notifications.</p>
				<Button onClick={() => void query.refetch()}>Try again</Button>
			</div>
		);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex gap-2">
					<Button
						variant={unreadOnly ? "outline" : "default"}
						aria-pressed={!unreadOnly}
						onClick={() => setUnreadOnly(false)}
					>
						All
					</Button>
					<Button
						variant={unreadOnly ? "default" : "outline"}
						aria-pressed={unreadOnly}
						onClick={() => setUnreadOnly(true)}
					>
						Unread ({unread.length})
					</Button>
				</div>
				<Button
					variant="outline"
					disabled={pending || unread.length === 0}
					onClick={() => void read()}
				>
					Mark all as read
				</Button>
			</div>
			{visible.length === 0 ? (
				<div
					role="status"
					className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center"
				>
					<span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
						<BellIcon className="size-5" aria-hidden="true" />
					</span>
					<p className="text-sm font-medium">
						{unreadOnly ? "You’re all caught up." : "No notifications yet."}
					</p>
					<p className="text-sm text-muted-foreground">
						{unreadOnly
							? "There are no unread updates to review."
							: "Updates about your orders, programs, and claims will appear here."}
					</p>
				</div>
			) : (
				<ul className="space-y-3">
					{visible.map((item) => {
						const href = entityLink(item);
						return (
							<li key={item.id}>
								<Card className={item.readAt ? "" : "ring-primary/40"}>
									<CardContent>
										<div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
											<div className="min-w-0 flex-1 space-y-1">
												<h2 className="line-clamp-2 break-words font-medium">
													{!item.readAt && (
														<span
															className="mr-2 inline-block size-2 rounded-full bg-primary"
															role="img"
															aria-label="Unread"
														/>
													)}
													{item.title}
												</h2>
												<time
													className="text-meta text-muted-foreground"
													dateTime={item.createdAt}
												>
													{formatDisplayDateTime(item.createdAt)}
												</time>
											</div>
											{!item.readAt && (
												<Button
													size="sm"
													variant="outline"
													disabled={pending}
													onClick={() => void read(item.id)}
												>
													Mark as read
												</Button>
											)}
										</div>
										<p className="max-w-prose whitespace-pre-wrap break-words text-sm">
											{item.message}
										</p>
										{href && (
											<Link
												href={href}
												className="text-sm text-primary underline underline-offset-4"
												onClick={() => {
													if (!item.readAt) void read(item.id);
												}}
											>
												View details
											</Link>
										)}
									</CardContent>
								</Card>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
