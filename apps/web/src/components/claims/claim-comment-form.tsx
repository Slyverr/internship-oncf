"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
	getClaimsControllerFindOneQueryKey,
	getClaimsControllerGetCommentsQueryKey,
	useClaimsControllerAddComment,
} from "@/lib/api/claims";

interface ClaimCommentFormProps {
	claimId: number;
}

export function ClaimCommentForm({ claimId }: ClaimCommentFormProps) {
	const queryClient = useQueryClient();
	const [content, setContent] = useState("");

	const mutation = useClaimsControllerAddComment();

	const handleSubmit = () => {
		if (!content.trim()) return;

		mutation.mutate(
			{
				id: claimId,
				data: { content: content.trim() },
			},
			{
				onSuccess: () => {
					setContent("");
					void queryClient.invalidateQueries({
						queryKey: getClaimsControllerGetCommentsQueryKey(claimId),
					});
					void queryClient.invalidateQueries({
						queryKey: getClaimsControllerFindOneQueryKey(claimId),
					});
				},
			},
		);
	};

	const isPending = mutation.isPending;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Add Comment</CardTitle>
			</CardHeader>

			<CardContent>
				<div className="space-y-2">
					<Textarea
						placeholder="Write a comment..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={3}
						disabled={isPending}
					/>

					<div className="flex justify-end">
						<Button
							onClick={handleSubmit}
							disabled={isPending || !content.trim()}
						>
							{isPending ? "Sending..." : "Send Comment"}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
