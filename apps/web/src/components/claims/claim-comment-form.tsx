"use client";

import { useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
	getClaimsControllerFindOneQueryKey,
	getClaimsControllerGetCommentsQueryKey,
	useClaimsControllerAddComment,
} from "@/lib/api/claims";
import { getFormErrorMessage } from "@/lib/form-utils";

interface ClaimCommentFormProps {
	claimId: number;
}

export function ClaimCommentForm({ claimId }: ClaimCommentFormProps) {
	const queryClient = useQueryClient();
	const [content, setContent] = useState("");

	const mutation = useClaimsControllerAddComment();

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedContent = content.trim();
		if (!trimmedContent || mutation.isPending) return;

		try {
			await mutation.mutateAsync({
				id: claimId,
				data: { content: trimmedContent },
			});
			setContent("");
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
				title: "Comment added",
				description: "Your comment has been added to this claim.",
			});
		} catch (error) {
			toast.add({
				type: "error",
				title: "Could not add comment",
				description:
					getFormErrorMessage(error) ?? "Please try again in a moment.",
			});
		}
	};

	const isPending = mutation.isPending;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Add Comment</CardTitle>
			</CardHeader>

			<CardContent>
				<form className="oncf-field" onSubmit={handleSubmit}>
					<Textarea
						aria-label="Comment"
						placeholder="Write a comment..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={3}
						maxLength={2000}
						disabled={isPending}
					/>
					<p className="text-meta text-muted-foreground" aria-live="polite">
						{content.length}/2000 characters
					</p>

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={isPending || !content.trim() || content.length > 2000}
						>
							{isPending ? "Sending..." : "Send Comment"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
