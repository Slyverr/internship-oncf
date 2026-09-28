"use client";

import { Permission } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircleIcon, SendIcon } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
	getClaimsControllerFindOneQueryKey,
	getClaimsControllerGetCommentsQueryKey,
	useClaimsControllerAddComment,
	useClaimsControllerGetComments,
} from "@/lib/api/claims";
import type { ClaimCommentDto } from "@/lib/api/generated.schemas";
import {
	getNotificationsControllerFindAllQueryKey,
	useNotificationsControllerFindAll,
	useNotificationsControllerMarkAsRead,
} from "@/lib/api/notifications";
import { isUnreadClaimCommentNotification } from "@/lib/claim-conversation-utils";
import { getFormErrorMessage } from "@/lib/form-utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface ClaimConversationProps {
	claimId: number;
	commentCount: number;
}

function CommentMessage({
	comment,
	currentUserId,
}: {
	comment: ClaimCommentDto;
	currentUserId: number;
}) {
	const isOwnMessage = comment.authorUserId === currentUserId;
	const date = new Date(comment.createdAt);
	const messageTime = new Intl.DateTimeFormat(undefined, {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
	const fullMessageTime = new Intl.DateTimeFormat(undefined, {
		dateStyle: "full",
		timeStyle: "short",
	}).format(date);
	const initials = comment.authorName
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase();

	return (
		<li className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}>
			<article
				className={cn(
					"grid max-w-[88%] gap-2 rounded-2xl border p-3 sm:max-w-[80%] sm:p-4",
					isOwnMessage
						? "rounded-br-md border-primary/20 bg-primary/10"
						: "rounded-bl-md border-border bg-muted/70",
				)}
			>
				<div className="flex min-w-0 items-center gap-2">
					{!isOwnMessage && (
						<Avatar className="size-8 shrink-0">
							<AvatarFallback className="text-meta">{initials}</AvatarFallback>
						</Avatar>
					)}
					<span className="truncate text-xs font-semibold text-foreground/80">
						{isOwnMessage ? "You" : comment.authorName}
					</span>
				</div>
				<p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
					{comment.comment}
				</p>
				<time
					dateTime={comment.createdAt}
					title={fullMessageTime}
					className="justify-self-end text-xs tabular-nums text-muted-foreground"
				>
					{messageTime}
				</time>
			</article>
		</li>
	);
}

export function ClaimConversation({
	claimId,
	commentCount,
}: ClaimConversationProps) {
	const { profile, hasPermission } = useAuth();
	const canComment = hasPermission(Permission.CLAIMS_ACTION_COMMENT);
	const [open, setOpen] = useState(false);
	const [content, setContent] = useState("");
	const queryClient = useQueryClient();
	const processedNotificationIds = useRef(new Set<number>());
	const messagesEndRef = useRef<HTMLLIElement>(null);
	const positionedAtLatest = useRef(false);
	const scrollAfterReply = useRef(false);
	const commentsQuery = useClaimsControllerGetComments(claimId, {
		query: { enabled: open },
	});
	const notificationsQuery = useNotificationsControllerFindAll({
		query: { refetchInterval: 30000 },
	});
	const addComment = useClaimsControllerAddComment();
	const markRead = useNotificationsControllerMarkAsRead();
	const unreadComments = useMemo(
		() =>
			(notificationsQuery.data ?? []).filter((notification) =>
				isUnreadClaimCommentNotification(notification, claimId),
			),
		[claimId, notificationsQuery.data],
	);
	const chronological = useMemo(
		() =>
			[...(commentsQuery.data ?? [])].sort(
				(first, second) =>
					new Date(first.createdAt).getTime() -
					new Date(second.createdAt).getTime(),
			),
		[commentsQuery.data],
	);
	const commentsUpdatedAt = commentsQuery.dataUpdatedAt;

	useEffect(() => {
		if (!open) {
			positionedAtLatest.current = false;
			return;
		}
		if (commentsQuery.isLoading || commentsQuery.isError || !commentsUpdatedAt)
			return;
		if (positionedAtLatest.current && !scrollAfterReply.current) return;

		messagesEndRef.current?.scrollIntoView({ block: "end" });
		positionedAtLatest.current = true;
		scrollAfterReply.current = false;
	}, [commentsUpdatedAt, commentsQuery.isError, commentsQuery.isLoading, open]);

	useEffect(() => {
		if (!open) {
			processedNotificationIds.current.clear();
			return;
		}
		if (unreadComments.length === 0) return;
		const unread = unreadComments.filter(
			(notification) => !processedNotificationIds.current.has(notification.id),
		);
		if (unread.length === 0) return;
		for (const notification of unread) {
			processedNotificationIds.current.add(notification.id);
		}

		void Promise.all(
			unread.map((notification) =>
				markRead.mutateAsync({ id: notification.id }),
			),
		)
			.then(() =>
				Promise.all([
					queryClient.invalidateQueries({
						queryKey: getNotificationsControllerFindAllQueryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: ["/notifications/unread-count"],
					}),
				]),
			)
			.catch((error: unknown) => {
				void Promise.all([
					queryClient.invalidateQueries({
						queryKey: getNotificationsControllerFindAllQueryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: ["/notifications/unread-count"],
					}),
				]);
				toast.add({
					type: "error",
					title: "Could not mark conversation as read",
					description:
						getFormErrorMessage(error) ?? "Please try again in a moment.",
				});
			});
	}, [open, unreadComments, markRead.mutateAsync, queryClient]);

	async function submitComment(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmedContent = content.trim();
		if (!trimmedContent || addComment.isPending) return;

		try {
			await addComment.mutateAsync({
				id: claimId,
				data: { content: trimmedContent },
			});
			setContent("");
			scrollAfterReply.current = true;
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: getClaimsControllerGetCommentsQueryKey(claimId),
				}),
				queryClient.invalidateQueries({
					queryKey: getClaimsControllerFindOneQueryKey(claimId),
				}),
			]);
			toast.add({
				type: "success",
				title: "Reply sent",
				description: "Your reply was added to the claim conversation.",
			});
		} catch (error) {
			toast.add({
				type: "error",
				title: "Could not send reply",
				description:
					getFormErrorMessage(error) ?? "Please try again in a moment.",
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button
				type="button"
				variant="outline"
				aria-label={`Open conversation, ${commentCount} ${commentCount === 1 ? "message" : "messages"}${unreadComments.length > 0 ? ", new messages" : ""}`}
				onClick={() => setOpen(true)}
				className="relative"
			>
				<MessageCircleIcon aria-hidden="true" />
				Conversation
				<span className="tabular-nums text-muted-foreground">
					{commentCount}
				</span>
				{unreadComments.length > 0 && (
					<span
						aria-hidden="true"
						className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-background"
					/>
				)}
			</Button>
			<DialogContent size="conversation" className="gap-0 overflow-hidden p-0">
				<DialogHeader className="px-4 py-3 sm:px-6">
					<DialogTitle className="truncate text-base sm:text-lg">
						Claim #{claimId} conversation
					</DialogTitle>
				</DialogHeader>
				<DialogBody className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
					<section
						aria-label="Conversation messages, oldest first"
						className="min-h-0 overflow-y-auto p-4 sm:p-6"
					>
						{commentsQuery.isLoading ? (
							<div className="grid gap-4">
								<Skeleton className="h-16 w-4/5" />
								<Skeleton className="h-16 w-3/5 justify-self-end" />
								<Skeleton className="h-16 w-4/5" />
							</div>
						) : commentsQuery.isError ? (
							<div className="grid min-h-full content-center justify-items-center gap-4 text-center">
								<p role="alert" className="text-sm text-destructive">
									Could not load this conversation.
								</p>
								<Button
									variant="outline"
									onClick={() => void commentsQuery.refetch()}
								>
									Try again
								</Button>
							</div>
						) : chronological.length > 0 ? (
							<ul className="flex min-h-full flex-col justify-end gap-3">
								{chronological.map((comment) => (
									<CommentMessage
										key={comment.id}
										comment={comment}
										currentUserId={profile.id}
									/>
								))}
								<li
									ref={messagesEndRef}
									aria-hidden="true"
									className="h-0 shrink-0"
								/>
							</ul>
						) : (
							<div className="grid min-h-full content-center justify-items-center gap-2 text-center">
								<MessageCircleIcon
									className="size-8 text-muted-foreground"
									aria-hidden="true"
								/>
								<p className="font-medium">No messages yet</p>
								<p className="text-sm text-muted-foreground">
									Start the conversation with a reply about this claim.
								</p>
							</div>
						)}
					</section>
					{canComment && (
						<form className="border-t p-4 sm:p-6" onSubmit={submitComment}>
							<div className="flex items-end gap-2 rounded-xl border bg-background p-1 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
								<Textarea
									aria-label="Write a reply"
									placeholder="Write a reply…"
									value={content}
									onChange={(event) => setContent(event.target.value)}
									rows={1}
									maxLength={2000}
									disabled={addComment.isPending}
									className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-lg border-0 bg-transparent px-3 py-3 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
								/>
								<Button
									type="submit"
									aria-label="Send reply"
									size="icon"
									className="size-11 shrink-0 rounded-lg"
									disabled={addComment.isPending || !content.trim()}
								>
									<SendIcon aria-hidden="true" />
								</Button>
							</div>
						</form>
					)}
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
