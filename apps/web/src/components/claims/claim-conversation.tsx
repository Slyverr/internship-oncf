"use client";

import { Permission } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import { MessageCircleIcon, SendIcon } from "lucide-react";
import {
	type FormEvent,
	Fragment,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { type AppLocale, Messages, type TypedMessageTranslator } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
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
import {
	getConversationScrollAction,
	isUnreadClaimCommentNotification,
} from "@/lib/claim-conversation-utils";
import {
	formatFullMessageTime,
	formatMessageTime,
	formatMonthDay,
} from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface ClaimConversationProps {
	claimId: number;
	claimNumber: string;
	commentCount: number;
	claimCreator: { id: number; name: string };
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase();
}

function CommentMessage({
	comment,
	currentUserId,
	locale,
	t,
	grouped,
	groupPosition,
	startsNewDay,
	timeVisible,
	onHoverTime,
	onToggleTime,
}: {
	comment: ClaimCommentDto;
	currentUserId: number;
	locale: AppLocale;
	t: TypedMessageTranslator;
	grouped: boolean;
	groupPosition: "single" | "first" | "middle" | "last";
	startsNewDay: boolean;
	timeVisible: boolean;
	onHoverTime: (id: number | null) => void;
	onToggleTime: () => void;
}) {
	const isOwnMessage = comment.authorUserId === currentUserId;
	const messageTime = formatMessageTime(comment.createdAt, locale);
	const fullMessageTime = formatFullMessageTime(comment.createdAt, locale);
	const authorName =
		comment.authorName ?? t(Messages.claims.conversation.formerUser);
	const initials = getInitials(authorName);
	const showIncomingAvatar =
		!isOwnMessage && (groupPosition === "single" || groupPosition === "last");
	const groupedCornerRadius = isOwnMessage
		? {
				first: "rounded-br-sm",
				middle: "rounded-tr-sm rounded-br-sm",
				last: "rounded-tr-sm",
			}
		: {
				first: "rounded-bl-sm",
				middle: "rounded-tl-sm rounded-bl-sm",
				last: "rounded-tl-sm",
			};
	return (
		<li
			className={cn(
				"flex",
				startsNewDay ? "pt-0" : grouped ? "pt-0.5" : "pt-3",
			)}
		>
			<div
				className={cn(
					"group/message flex w-fit max-w-[92%] flex-col sm:max-w-[80%]",
					isOwnMessage ? "ml-auto items-end" : "mr-auto items-start",
				)}
				onPointerEnter={(event) => {
					if (event.pointerType === "mouse") onHoverTime(comment.id);
				}}
				onPointerLeave={(event) => {
					if (event.pointerType === "mouse") onHoverTime(null);
				}}
			>
				<div className="flex max-w-full items-end gap-2">
					{!isOwnMessage &&
						(showIncomingAvatar ? (
							<Avatar
								className={cn(
									"size-8 shrink-0 border border-border/70",
									groupPosition !== "single" && "rounded-bl-sm",
								)}
							>
								<AvatarFallback className="text-caption font-medium">
									{initials}
								</AvatarFallback>
							</Avatar>
						) : (
							<span aria-hidden="true" className="size-8 shrink-0" />
						))}
					<button
						type="button"
						aria-expanded={timeVisible}
						aria-label={t(Messages.claims.conversation.messageAccessibleLabel, {
							author: authorName,
							message: comment.comment,
							time: fullMessageTime,
						})}
						onClick={onToggleTime}
						className={cn(
							"grid w-fit min-w-0 max-w-full gap-0 rounded-2xl border px-3 py-1 text-left font-normal transition-colors hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
							groupPosition !== "single" && groupedCornerRadius[groupPosition],
							isOwnMessage
								? "border-primary/20 bg-primary/10"
								: "border-border bg-muted/70",
						)}
					>
						{!grouped && !isOwnMessage && (
							<span className="mb-1 truncate text-xs font-semibold text-foreground/80">
								{authorName}
							</span>
						)}
						<span className="block whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
							{comment.comment}
						</span>
					</button>
				</div>
				<div
					aria-hidden={!timeVisible}
					className={cn(
						"overflow-hidden text-micro leading-3 tabular-nums text-muted-foreground transition-[max-height,opacity,margin] duration-200 motion-reduce:transition-none",
						isOwnMessage ? "self-end" : "self-start",
						timeVisible ? "mt-1 max-h-3 opacity-100" : "mt-0 max-h-0 opacity-0",
					)}
				>
					<time dateTime={comment.createdAt}>{messageTime}</time>
				</div>
			</div>
		</li>
	);
}

function getMessageDayLabel(
	value: string,
	locale: AppLocale,
	t: TypedMessageTranslator,
) {
	const date = new Date(value);
	if (isToday(date)) return t(Messages.claims.conversation.today);
	if (isYesterday(date)) return t(Messages.claims.conversation.yesterday);
	return formatMonthDay(date, locale);
}

function getMessageDayKey(value: string) {
	return format(new Date(value), "yyyy-MM-dd");
}

export function ClaimConversation({
	claimId,
	claimNumber,
	commentCount,
	claimCreator,
}: ClaimConversationProps) {
	const t = useTranslate();
	const getErrorMessage = useFormErrorMessage();
	const locale = useLocale();
	const { profile, hasPermission } = useAuth();
	const canComment = hasPermission(Permission.CLAIMS_ACTION_COMMENT);
	const [open, setOpen] = useState(false);
	const [content, setContent] = useState("");
	const [pinnedTimeId, setPinnedTimeId] = useState<number | null>(null);
	const [hoveredTimeId, setHoveredTimeId] = useState<number | null>(null);
	const visibleTimeId = hoveredTimeId ?? pinnedTimeId;
	const queryClient = useQueryClient();
	const processedNotificationIds = useRef(new Set<number>());
	const messagesEndRef = useRef<HTMLLIElement>(null);
	const positionedAtLatest = useRef(false);
	const scrollAfterReply = useRef(false);
	const composerRef = useRef<HTMLTextAreaElement>(null);
	const restoreComposerFocus = useRef(false);
	const nearLatest = useRef(true);
	const previousCommentCount = useRef(0);
	const [hasNewMessages, setHasNewMessages] = useState(false);
	const commentsQuery = useClaimsControllerGetComments(claimNumber, {
		query: { enabled: open, refetchInterval: open ? 5000 : false },
	});
	const notificationsQuery = useNotificationsControllerFindAll({
		query: { refetchInterval: 30000 },
	});
	const addComment = useClaimsControllerAddComment();
	const markRead = useNotificationsControllerMarkAsRead();
	useEffect(() => {
		if (!open || !canComment) return;
		const frame = window.requestAnimationFrame(() => {
			composerRef.current?.focus({ preventScroll: true });
		});
		return () => window.cancelAnimationFrame(frame);
	}, [canComment, open]);
	useEffect(() => {
		if (addComment.isPending || !restoreComposerFocus.current) return;
		restoreComposerFocus.current = false;
		if (open) composerRef.current?.focus();
	}, [addComment.isPending, open]);
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
	const participants = useMemo(() => {
		const byUserId = new Map<number, string>([
			[claimCreator.id, claimCreator.name],
		]);
		for (const comment of chronological) {
			if (!byUserId.has(comment.authorUserId)) {
				byUserId.set(
					comment.authorUserId,
					comment.authorName ?? t(Messages.claims.conversation.formerUser),
				);
			}
		}
		return [...byUserId].map(([id, name]) => ({ id, name }));
	}, [claimCreator.id, claimCreator.name, chronological, t]);
	const conversationDayKeys = new Set(
		chronological.map((comment) => getMessageDayKey(comment.createdAt)),
	);
	const hasMultipleConversationDays = conversationDayKeys.size > 1;
	const hasOlderOnlyDay =
		chronological.length > 0 &&
		!isToday(new Date(chronological[chronological.length - 1].createdAt));
	const showDateSeparators = hasMultipleConversationDays || hasOlderOnlyDay;
	const commentsUpdatedAt = commentsQuery.dataUpdatedAt;

	useEffect(() => {
		if (!open) {
			positionedAtLatest.current = false;
			nearLatest.current = true;
			previousCommentCount.current = 0;
			setHasNewMessages(false);
			return;
		}
		if (commentsQuery.isLoading || commentsQuery.isError || !commentsUpdatedAt)
			return;
		const scrollAction = getConversationScrollAction({
			positionedAtLatest: positionedAtLatest.current,
			scrollAfterReply: scrollAfterReply.current,
			nearLatest: nearLatest.current,
			previousMessageCount: previousCommentCount.current,
			nextMessageCount: chronological.length,
		});
		if (scrollAction === "show-new") setHasNewMessages(true);
		if (scrollAction === "follow-latest") {
			messagesEndRef.current?.scrollIntoView({ block: "end" });
			nearLatest.current = true;
			setHasNewMessages(false);
		}
		previousCommentCount.current = chronological.length;
		positionedAtLatest.current = true;
		scrollAfterReply.current = false;
	}, [
		commentsUpdatedAt,
		commentsQuery.isError,
		commentsQuery.isLoading,
		chronological.length,
		open,
	]);

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
					title: t(Messages.claims.conversation.markReadFailed),
					description:
						getErrorMessage(error) ?? t(Messages.claims.conversation.tryAgain),
				});
			});
	}, [
		open,
		unreadComments,
		markRead.mutateAsync,
		queryClient,
		t,
		getErrorMessage,
	]);

	async function submitComment(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmedContent = content.trim();
		if (!trimmedContent || addComment.isPending) return;

		restoreComposerFocus.current = true;
		try {
			await addComment.mutateAsync({
				id: claimNumber,
				data: { content: trimmedContent },
			});
			setContent("");
			scrollAfterReply.current = true;
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: getClaimsControllerGetCommentsQueryKey(claimNumber),
				}),
				queryClient.invalidateQueries({
					queryKey: getClaimsControllerFindOneQueryKey(claimNumber),
				}),
			]);
			toast.add({
				type: "success",
				title: t(Messages.claims.conversation.replySent),
				description: t(Messages.claims.conversation.replyAdded),
			});
		} catch (error) {
			toast.add({
				type: "error",
				title: t(Messages.claims.conversation.sendFailed),
				description:
					getErrorMessage(error) ?? t(Messages.claims.conversation.tryAgain),
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Button
				type="button"
				variant="outline"
				aria-label={t(Messages.claims.conversation.openCount, {
					count: commentCount,
					unreadSuffix:
						unreadComments.length > 0
							? t(Messages.claims.conversation.unreadSuffix)
							: "",
				})}
				onClick={() => setOpen(true)}
				className="relative"
			>
				<MessageCircleIcon aria-hidden="true" />
				{t(Messages.claims.conversation.button)}
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
				<DialogHeader className="items-center gap-0 px-4 py-2 pb-2 sm:px-6">
					<div className="flex min-w-0 items-center justify-between gap-2">
						<div className="flex min-w-0 items-baseline gap-2">
							<DialogTitle className="shrink-0 text-base">
								{t(Messages.claims.conversation.dialogTitle)}
							</DialogTitle>
							<DialogDescription className="min-w-0 truncate text-caption">
								<span className="sr-only">{claimNumber} · </span>
								{t(Messages.claims.conversation.messagesCount, {
									count: chronological.length || commentCount,
								})}
							</DialogDescription>
						</div>
						<Popover>
							<PopoverTrigger
								render={
									<Button
										variant="ghost"
										size="sm"
										aria-label={t(
											Messages.claims.conversation.participantsAccessibleLabel,
											{
												names: participants.map(({ name }) => name).join(", "),
											},
										)}
										title={participants.map(({ name }) => name).join(", ")}
										className="h-9 shrink-0 gap-1 px-0"
									/>
								}
							>
								<AvatarGroup
									aria-hidden="true"
									className="-space-x-1 *:data-[slot=avatar]:ring-0"
								>
									{participants.slice(0, 3).map(({ id, name }) => (
										<Avatar key={id} className="size-7 after:hidden">
											<AvatarFallback className="text-micro">
												{getInitials(name)}
											</AvatarFallback>
										</Avatar>
									))}
									{participants.length > 3 && (
										<AvatarGroupCount className="size-7 text-micro">
											+{participants.length - 3}
										</AvatarGroupCount>
									)}
								</AvatarGroup>
								<span className="text-caption tabular-nums text-muted-foreground">
									{participants.length}
								</span>
							</PopoverTrigger>
							<PopoverContent
								aria-label={t(Messages.claims.conversation.participantsTitle)}
							>
								<div className="mb-3 flex items-baseline justify-between gap-4">
									<p className="text-sm font-semibold">
										{t(Messages.claims.conversation.participantsTitle)}
									</p>
									<span className="text-caption text-muted-foreground">
										{t(Messages.claims.conversation.participantsCount, {
											count: participants.length,
										})}
									</span>
								</div>
								<ul className="grid gap-compact">
									{participants.map(({ id, name }) => (
										<li key={id} className="flex min-w-0 items-center gap-3">
											<Avatar className="size-8">
												<AvatarFallback className="text-caption">
													{getInitials(name)}
												</AvatarFallback>
											</Avatar>
											<span className="truncate text-sm">{name}</span>
										</li>
									))}
								</ul>
							</PopoverContent>
						</Popover>
					</div>
				</DialogHeader>
				<DialogBody className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
					<section
						aria-label={t(Messages.claims.conversation.messagesLabel)}
						className="min-h-0 overflow-y-auto p-4 sm:p-6"
						onScroll={(event) => {
							const element = event.currentTarget;
							nearLatest.current =
								element.scrollHeight -
									element.scrollTop -
									element.clientHeight <=
								48;
							if (nearLatest.current) setHasNewMessages(false);
						}}
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
									{t(Messages.claims.conversation.loadFailed)}
								</p>
								<Button
									variant="outline"
									onClick={() => void commentsQuery.refetch()}
								>
									{t(Messages.claims.conversation.tryAgainAction)}
								</Button>
							</div>
						) : chronological.length > 0 ? (
							<ul className="flex min-h-full flex-col justify-end">
								{chronological.map((comment, index) => {
									const previousComment = chronological[index - 1];
									const startsNewDay =
										!previousComment ||
										getMessageDayKey(previousComment.createdAt) !==
											getMessageDayKey(comment.createdAt);
									const nextComment = chronological[index + 1];
									const groupedPrevious =
										!startsNewDay &&
										previousComment?.authorUserId === comment.authorUserId;
									const groupedNext =
										nextComment?.authorUserId === comment.authorUserId &&
										getMessageDayKey(nextComment.createdAt) ===
											getMessageDayKey(comment.createdAt);
									const groupPosition = groupedPrevious
										? groupedNext
											? "middle"
											: "last"
										: groupedNext
											? "first"
											: "single";

									return (
										<Fragment key={comment.id}>
											{startsNewDay && showDateSeparators && (
												<li className="flex justify-center py-3">
													<time
														dateTime={getMessageDayKey(comment.createdAt)}
														className="text-caption text-muted-foreground"
													>
														{getMessageDayLabel(comment.createdAt, locale, t)}
													</time>
												</li>
											)}
											<CommentMessage
												comment={comment}
												currentUserId={profile.id}
												locale={locale}
												t={t}
												grouped={groupedPrevious}
												groupPosition={groupPosition}
												startsNewDay={startsNewDay}
												timeVisible={visibleTimeId === comment.id}
												onHoverTime={setHoveredTimeId}
												onToggleTime={() =>
													setPinnedTimeId((current) =>
														current === comment.id ? null : comment.id,
													)
												}
											/>
										</Fragment>
									);
								})}
								<li
									ref={messagesEndRef}
									aria-hidden="true"
									className="h-4 shrink-0"
								/>
							</ul>
						) : (
							<div className="grid min-h-full content-center justify-items-center gap-2 text-center">
								<MessageCircleIcon
									className="size-8 text-muted-foreground"
									aria-hidden="true"
								/>
								<p className="font-medium">
									{t(Messages.claims.conversation.emptyTitle)}
								</p>
								<p className="text-sm text-muted-foreground">
									{t(Messages.claims.conversation.emptyDescription)}
								</p>
							</div>
						)}
						{hasNewMessages && (
							<div className="sticky bottom-2 z-10 mx-auto w-fit">
								<Button
									type="button"
									size="sm"
									variant="secondary"
									onClick={() => {
										messagesEndRef.current?.scrollIntoView({
											behavior: "smooth",
											block: "end",
										});
										nearLatest.current = true;
										setHasNewMessages(false);
									}}
								>
									{t(Messages.claims.conversation.showNewMessages)}
								</Button>
							</div>
						)}
					</section>
					{canComment && (
						<form className="border-t p-4 sm:p-6" onSubmit={submitComment}>
							<div className="flex items-end gap-2 rounded-xl border bg-background p-1 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
								<Textarea
									ref={composerRef}
									aria-label={t(Messages.claims.conversation.writeReply)}
									placeholder={t(Messages.claims.conversation.replyPlaceholder)}
									value={content}
									onChange={(event) => setContent(event.target.value)}
									onKeyDown={(event) => {
										if (
											event.key !== "Enter" ||
											event.shiftKey ||
											event.nativeEvent.isComposing
										)
											return;
										event.preventDefault();
										event.currentTarget.form?.requestSubmit();
									}}
									rows={1}
									maxLength={2000}
									readOnly={addComment.isPending}
									className="field-sizing-content max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-lg border-0 bg-transparent px-3 py-3 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
								/>
								<Button
									type="submit"
									aria-label={t(Messages.claims.conversation.sendReply)}
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
