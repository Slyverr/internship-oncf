"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClaimsControllerGetComments } from "@/lib/api/claims";
import type { ClaimCommentDto } from "@/lib/api/generated.schemas";

interface ClaimCommentsProps {
	claimId: number;
}

function CommentItem({ comment }: { comment: ClaimCommentDto }) {
	const authorName = "User"; // TODO: Author name not available in DTO
	const initials = authorName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<div className="flex gap-3 py-3 border-b last:border-0">
			<Avatar className="size-8">
				<AvatarImage alt={authorName} />
				<AvatarFallback className="bg-primary/10 text-primary text-xs">
					{initials}
				</AvatarFallback>
			</Avatar>

			<div className="flex-1 space-y-1">
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium">{authorName}</span>
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(comment.createdAt), {
							addSuffix: true,
						})}
					</span>
				</div>
				<p className="text-sm">{comment.comment}</p>
			</div>
		</div>
	);
}

export function ClaimComments({ claimId }: ClaimCommentsProps) {
	const { data: comments, isLoading } = useClaimsControllerGetComments(claimId);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageCircleIcon className="size-4" />
						Comments
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-12 w-full" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageCircleIcon className="size-4" />
					Comments {comments?.length ? `(${comments.length})` : ""}
				</CardTitle>
			</CardHeader>

			<CardContent>
				{comments && comments.length > 0 ? (
					<div className="divide-y">
						{comments.map((comment) => (
							<CommentItem key={comment.id} comment={comment} />
						))}
					</div>
				) : (
					<p className="text-sm text-muted-foreground">No comments yet.</p>
				)}
			</CardContent>
		</Card>
	);
}
