"use client";

import { ClaimPriority, ClaimType, Permission } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ClaimPrioritySelect } from "@/components/claims/claim-priority-select";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Messages } from "@/i18n";
import { getClaimTypeLabel } from "@/i18n/claim-labels";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import {
	getClaimsControllerFindOneQueryKey,
	useClaimsControllerUpdate,
} from "@/lib/api/claims";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";
import { getFormErrorMessage } from "@/lib/form-utils";
import { useAuth } from "@/providers/auth-provider";

export function ClaimEditForm({ claim }: { claim: ClaimDetailDto }) {
	const locale = useLocale();
	const t = useTranslate();
	const router = useRouter();
	const queryClient = useQueryClient();
	const updateDetailCache = useUpdateDetailCache<ClaimDetailDto, string>(
		getClaimsControllerFindOneQueryKey,
		(updatedClaim) => updatedClaim.claimNumber,
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
				title: t(Messages.claims.edit.descriptionTooShortTitle),
				description: t(Messages.claims.edit.descriptionTooShort),
			});
			return;
		}

		try {
			const updated = await mutation.mutateAsync({
				id: claim.claimNumber,
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
				title: t(Messages.claims.edit.savedTitle),
				description: t(Messages.claims.edit.savedDescription),
			});
			router.push(`/dashboard/claims/${claim.claimNumber}`);
			router.refresh();
		} catch (error) {
			toast.add({
				type: "error",
				title: t(Messages.claims.edit.saveFailedTitle),
				description: getFormErrorMessage(error, locale),
			});
		}
	}

	if (!canEdit) {
		return <p role="alert">{t(Messages.claims.edit.noPermission)}</p>;
	}

	return (
		<form onSubmit={submit} className="workspace-form">
			<PageHeader
				title={t(Messages.claims.edit.title, {
					recordCode: claim.claimNumber,
				})}
				description={t(Messages.claims.edit.description)}
			/>
			<Card>
				<CardContent className="space-y-4">
					<div className="grid gap-4 @3xl/workspace:grid-cols-2">
						<div className="oncf-field">
							<Label htmlFor="claimType">
								{t(Messages.claims.edit.claimType)}
							</Label>
							<Select
								value={type}
								onValueChange={(value) => value && setType(value as ClaimType)}
							>
								<SelectTrigger id="claimType" className="w-full">
									<SelectValue>{getClaimTypeLabel(type, locale)}</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{Object.values(ClaimType).map((claimType) => (
										<SelectItem key={claimType} value={claimType}>
											{getClaimTypeLabel(claimType, locale)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="oncf-field">
							<Label htmlFor="claimPriority">
								{t(Messages.claims.edit.priority)}
							</Label>
							<ClaimPrioritySelect value={priority} onChange={setPriority} />
						</div>
					</div>
					<div className="oncf-field">
						<Label htmlFor="description">
							{t(Messages.claims.edit.details)}
						</Label>
						<Textarea
							id="description"
							placeholder={t(Messages.claims.edit.placeholder)}
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
					onClick={() => router.push(`/dashboard/claims/${claim.claimNumber}`)}
				>
					{t(Messages.claims.edit.cancel)}
				</Button>
				<Button type="submit" disabled={mutation.isPending || !hasChanges}>
					{mutation.isPending
						? t(Messages.claims.edit.saving)
						: t(Messages.claims.edit.save)}
				</Button>
			</div>
		</form>
	);
}
