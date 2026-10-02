"use client";

import { useQueryClient } from "@tanstack/react-query";
import { BellIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { translateNotificationMessage } from "@/i18n/notification-messages";
import {
	useNotificationsControllerFindAll,
	useNotificationsControllerMarkAllAsRead,
	useNotificationsControllerMarkAsRead,
} from "@/lib/api/notifications";
import { formatDisplayDateTime } from "@/lib/date-utils";
import { getNotificationHref } from "@/lib/notification-utils";

export function NotificationInbox() {
	const locale = useLocale();
	const t = useTranslate();
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
				title: t(Messages.notifications.markReadFailedTitle),
				description: t(Messages.notifications.tryAgainDescription),
			});
		}
	}

	if (query.isLoading)
		return <p role="status">{t(Messages.notifications.loading)}</p>;
	if (query.isError)
		return (
			<div role="alert" className="space-y-3">
				<p>{t(Messages.notifications.loadFailed)}</p>
				<Button onClick={() => void query.refetch()}>
					{t(Messages.notifications.tryAgain)}
				</Button>
			</div>
		);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex gap-2">
					<Button
						size="sm"
						variant={unreadOnly ? "outline" : "default"}
						aria-pressed={!unreadOnly}
						onClick={() => setUnreadOnly(false)}
					>
						{t(Messages.notifications.allFilter)}
					</Button>
					<Button
						size="sm"
						variant={unreadOnly ? "default" : "outline"}
						aria-pressed={unreadOnly}
						onClick={() => setUnreadOnly(true)}
					>
						{t(Messages.notifications.unreadFilter, {
							count: unread.length,
						})}
					</Button>
				</div>
				<Button
					variant="outline"
					disabled={pending || unread.length === 0}
					onClick={() => void read()}
				>
					{t(Messages.notifications.markAllRead)}
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
						{unreadOnly
							? t(Messages.notifications.caughtUpTitle)
							: t(Messages.notifications.noNotificationsTitle)}
					</p>
					<p className="text-sm text-muted-foreground">
						{unreadOnly
							? t(Messages.notifications.noUnreadDescription)
							: t(Messages.notifications.emptyDescription)}
					</p>
				</div>
			) : (
				<ul className="space-y-3">
					{visible.map((item) => {
						const href = getNotificationHref(item);
						const content = translateNotificationMessage(item, locale);
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
															aria-label={t(Messages.notifications.unread)}
														/>
													)}
													{content.title}
												</h2>
												<time
													className="text-meta text-muted-foreground"
													dateTime={item.createdAt}
												>
													{formatDisplayDateTime(item.createdAt, locale)}
												</time>
											</div>
											{!item.readAt && (
												<Button
													size="sm"
													variant="outline"
													disabled={pending}
													onClick={() => void read(item.id)}
												>
													{t(Messages.notifications.markRead)}
												</Button>
											)}
										</div>
										<p className="max-w-prose whitespace-pre-wrap break-words text-sm">
											{content.body}
										</p>
										{href && (
											<Link
												href={href}
												className="text-sm text-primary underline underline-offset-4"
												onClick={() => {
													if (!item.readAt) void read(item.id);
												}}
											>
												{t(Messages.notifications.viewDetails)}
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
