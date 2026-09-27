"use client";

import { ClaimPriority, ClaimType, Permission } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ClaimPrioritySelect } from "@/components/claims/claim-priority-select";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useUpdateDetailCache } from "@/hooks/use-update-detail-cache";
import {
	getClaimsControllerFindOneQueryKey,
	useClaimsControllerUpdate,
} from "@/lib/api/claims";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";
import { getFormErrorMessage } from "@/lib/form-utils";
import { useAuth } from "@/providers/auth-provider";

export function ClaimEditForm({ claim }: { claim: ClaimDetailDto }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const updateDetailCache = useUpdateDetailCache<ClaimDetailDto>(
		getClaimsControllerFindOneQueryKey,
	);
	const { hasPermission } = useAuth();
	const mutation = useClaimsControllerUpdate();
	const initialType = claim.claimType.name as ClaimType;
	const initialPriority = (claim.priority as ClaimPriority | null) ?? null;
	const [type, setType] = useState(initialType);
	const [priority, setPriority] = useState<ClaimPriority | undefined>(
		initialPriority ?? undefined,
	);
	const [description, setDescription] = useState(claim.description);
	const hasChanges =
		type !== initialType ||
		priority !== (initialPriority ?? undefined) ||
		description.trim() !== claim.description;
	const canEdit = hasPermission(Permission.CLAIMS_UPDATE);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (mutation.isPending || !hasChanges) return;

		const trimmedDescription = description.trim();
		if (trimmedDescription.length < 10) {
			toast.add({
				type: "error",
				title: "Description is too short",
				description: "Use at least 10 characters to describe the claim.",
			});
			return;
		}

		try {
			const updated = await mutation.mutateAsync({
				id: claim.id,
				data: {
					...(type !== initialType && { type }),
					...(priority && priority !== (initialPriority ?? undefined)
						? { priority }
						: {}),
					...(trimmedDescription !== claim.description && {
						description: trimmedDescription,
					}),
				},
			});
			updateDetailCache(updated);
			void queryClient.invalidateQueries({ queryKey: ["/claims"] });
			toast.add({
				type: "success",
				title: "Claim saved",
				description: "The claim details have been updated.",
			});
			router.push(`/dashboard/claims/${claim.id}`);
			router.refresh();
		} catch (error) {
			toast.add({
				type: "error",
				title: "Could not save claim",
				description: getFormErrorMessage(error),
			});
		}
	}

	if (!canEdit) {
		return <p role="alert">You do not have permission to edit this claim.</p>;
	}

	return (
		<form onSubmit={submit} className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Edit claim #{claim.id}</CardTitle>
					<CardDescription>
						Update the claim description, type, and priority. Workflow status is
						managed with the claim actions.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="claimType">Claim type</Label>
							<Select
								value={type}
								onValueChange={(value) => value && setType(value as ClaimType)}
							>
								<SelectTrigger id="claimType" className="w-full">
									<SelectValue placeholder="Select claim type" />
								</SelectTrigger>
								<SelectContent>
									{Object.values(ClaimType).map((claimType) => (
										<SelectItem key={claimType} value={claimType}>
											{claimType.replaceAll("_", " ").toLowerCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="claimPriority">Priority</Label>
							<ClaimPrioritySelect value={priority} onChange={setPriority} />
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							minLength={10}
							required
						/>
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					type="button"
					disabled={mutation.isPending}
					onClick={() => router.push(`/dashboard/claims/${claim.id}`)}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={mutation.isPending || !hasChanges}>
					{mutation.isPending ? "Saving…" : "Save changes"}
				</Button>
			</div>
		</form>
	);
}
