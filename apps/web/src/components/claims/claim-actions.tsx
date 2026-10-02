"use client";

import { ClaimStatus, Permission } from "@ecommand/shared";
import { EllipsisVerticalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateDetailCache } from "@/hooks/use-update-detail-cache";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import {
	getClaimsControllerFindOneQueryKey,
	useClaimsControllerAwaitInfo,
	useClaimsControllerClose,
	useClaimsControllerReject,
	useClaimsControllerRemove,
	useClaimsControllerResolve,
	useClaimsControllerSendToDtm,
	useClaimsControllerStartProgress,
	useClaimsControllerStartTreatment,
} from "@/lib/api/claims";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";
import { useAuth } from "@/providers/auth-provider";
import { ConfirmDialog } from "../common/confirm-dialog";

export function ClaimActions({ claim }: { claim: ClaimDetailDto }) {
	const t = useTranslate();
	const { hasPermission } = useAuth();
	const updateClaimCache = useUpdateDetailCache<ClaimDetailDto, string>(
		getClaimsControllerFindOneQueryKey,
		(claim) => claim.claimNumber,
	);
	const router = useRouter();

	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const [rejectionReason, setRejectionReason] = useState("");
	const [resolutionText, setResolutionText] = useState("");

	const startProgressMutation = useClaimsControllerStartProgress();
	const awaitInfoMutation = useClaimsControllerAwaitInfo();
	const startTreatmentMutation = useClaimsControllerStartTreatment();
	const sendToDtmMutation = useClaimsControllerSendToDtm();
	const resolveMutation = useClaimsControllerResolve();
	const closeMutation = useClaimsControllerClose();
	const rejectMutation = useClaimsControllerReject();
	const removeMutation = useClaimsControllerRemove();

	const status = claim.claimStatus?.name;

	const isPending =
		startProgressMutation.isPending ||
		awaitInfoMutation.isPending ||
		startTreatmentMutation.isPending ||
		sendToDtmMutation.isPending ||
		resolveMutation.isPending ||
		closeMutation.isPending ||
		rejectMutation.isPending ||
		removeMutation.isPending;

	const handleReject = () => {
		rejectMutation.mutate(
			{
				id: claim.claimNumber,
				data: { rejectionReason },
			},
			{
				onSuccess: (updatedClaim) => {
					updateClaimCache(updatedClaim);
					setRejectDialogOpen(false);
					setRejectionReason("");
				},
			},
		);
	};

	const handleResolve = () => {
		resolveMutation.mutate(
			{
				id: claim.claimNumber,
				data: { resolution: resolutionText },
			},
			{
				onSuccess: (updatedClaim) => {
					updateClaimCache(updatedClaim);
					setResolveDialogOpen(false);
					setResolutionText("");
				},
			},
		);
	};

	const handleDelete = () => {
		removeMutation.mutate(
			{ id: claim.claimNumber },
			{
				onSuccess: () => {
					setDeleteDialogOpen(false);
					router.push("/dashboard/claims");
				},
			},
		);
	};

	return (
		<>
			<div className="flex flex-wrap items-center gap-4">
				{/* Start Progress: NEW -> IN_PROGRESS */}
				{hasPermission(Permission.CLAIMS_ACTION_START_PROGRESS) &&
					status === ClaimStatus.NEW && (
						<Button
							disabled={isPending}
							onClick={() =>
								startProgressMutation.mutate(
									{ id: claim.claimNumber },
									{ onSuccess: updateClaimCache },
								)
							}
						>
							{t(Messages.claims.actions.startInvestigation)}
						</Button>
					)}

				{/* Await information: IN_PROGRESS -> AWAITING_INFO */}
				{hasPermission(Permission.CLAIMS_ACTION_AWAIT_INFO) &&
					status === ClaimStatus.IN_PROGRESS && (
						<Button
							disabled={isPending}
							variant="outline"
							onClick={() =>
								awaitInfoMutation.mutate(
									{ id: claim.claimNumber },
									{ onSuccess: updateClaimCache },
								)
							}
						>
							{t(Messages.claims.actions.awaitInformation)}
						</Button>
					)}

				{/* Start treatment: IN_PROGRESS / AWAITING_INFO -> IN_TREATMENT */}
				{hasPermission(Permission.CLAIMS_ACTION_START_TREATMENT) &&
					(status === ClaimStatus.IN_PROGRESS ||
						status === ClaimStatus.AWAITING_INFO) && (
						<Button
							disabled={isPending}
							variant="secondary"
							onClick={() =>
								startTreatmentMutation.mutate(
									{ id: claim.claimNumber },
									{ onSuccess: updateClaimCache },
								)
							}
						>
							{t(Messages.claims.actions.startTreatment)}
						</Button>
					)}

				{/* Resolve: IN_TREATMENT -> RESOLVED */}
				{hasPermission(Permission.CLAIMS_ACTION_RESOLVE) &&
					status === ClaimStatus.IN_TREATMENT && (
						<Button
							variant="secondary"
							disabled={isPending}
							onClick={() => setResolveDialogOpen(true)}
						>
							{t(Messages.claims.actions.resolve)}
						</Button>
					)}

				{/* Close: RESOLVED -> CLOSED */}
				{hasPermission(Permission.CLAIMS_ACTION_CLOSE) &&
					status === ClaimStatus.RESOLVED && (
						<Button
							variant="outline"
							disabled={isPending}
							onClick={() =>
								closeMutation.mutate(
									{ id: claim.claimNumber },
									{ onSuccess: updateClaimCache },
								)
							}
						>
							{t(Messages.claims.actions.close)}
						</Button>
					)}

				{/* Reject: allowed by the backend transition rules */}
				{hasPermission(Permission.CLAIMS_ACTION_REJECT) &&
					(status === ClaimStatus.NEW ||
						status === ClaimStatus.IN_PROGRESS ||
						status === ClaimStatus.IN_TREATMENT) && (
						<Button
							variant="destructive"
							disabled={isPending}
							onClick={() => setRejectDialogOpen(true)}
						>
							{t(Messages.claims.actions.rejectButton)}
						</Button>
					)}

				{hasPermission(Permission.CLAIMS_ACTION_SEND_TO_DTM) &&
					(status === ClaimStatus.IN_PROGRESS ||
						status === ClaimStatus.IN_TREATMENT ||
						status === ClaimStatus.RESOLVED) && (
						<Button
							disabled={isPending}
							variant="outline"
							onClick={() =>
								sendToDtmMutation.mutate(
									{ id: claim.claimNumber },
									{ onSuccess: updateClaimCache },
								)
							}
						>
							{t(Messages.claims.actions.sendToDtm)}
						</Button>
					)}

				{/* Dropdown Menu for Edit and Delete */}
				{(hasPermission(Permission.CLAIMS_UPDATE) ||
					hasPermission(Permission.CLAIMS_DELETE)) && (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<button
									type="button"
									className={buttonVariants({ variant: "ghost", size: "icon" })}
								/>
							}
							disabled={isPending}
						>
							<EllipsisVerticalIcon />
							<span className="sr-only">{t(Messages.claims.actions.more)}</span>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{hasPermission(Permission.CLAIMS_UPDATE) && (
								<DropdownMenuItem
									onClick={() =>
										router.push(`/dashboard/claims/${claim.claimNumber}/edit`)
									}
								>
									{t(Messages.claims.actions.edit)}
								</DropdownMenuItem>
							)}

							{hasPermission(Permission.CLAIMS_DELETE) && (
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => setDeleteDialogOpen(true)}
								>
									{t(Messages.claims.actions.delete)}
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			{/* Resolve Dialog */}
			<AlertDialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
				<AlertDialogContent size="form">
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t(Messages.claims.actions.resolve)}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t(Messages.claims.actions.resolveDescription)}
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogBody>
						<Textarea
							value={resolutionText}
							onChange={(event) => setResolutionText(event.target.value)}
							placeholder={t(Messages.claims.actions.resolutionPlaceholder)}
						/>
					</AlertDialogBody>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>
							{t(Messages.claims.edit.cancel)}
						</AlertDialogCancel>

						<AlertDialogAction disabled={isPending} onClick={handleResolve}>
							{t(Messages.claims.actions.confirmResolution)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Reject Dialog */}
			<AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<AlertDialogContent size="form">
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t(Messages.claims.actions.reject)}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t(Messages.claims.actions.rejectDescription)}
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogBody>
						<Textarea
							value={rejectionReason}
							onChange={(event) => setRejectionReason(event.target.value)}
							placeholder={t(Messages.claims.actions.rejectionPlaceholder)}
						/>
					</AlertDialogBody>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>
							{t(Messages.claims.edit.cancel)}
						</AlertDialogCancel>

						<AlertDialogAction disabled={isPending} onClick={handleReject}>
							{t(Messages.claims.actions.confirmReject)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title={t(Messages.claims.actions.deleteTitle)}
				description={t(Messages.claims.actions.deleteDescription)}
				confirmLabel={t(Messages.claims.actions.delete)}
				variant="destructive"
				disabled={isPending}
				onConfirm={handleDelete}
			/>
		</>
	);
}
