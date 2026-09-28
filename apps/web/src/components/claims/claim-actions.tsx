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
	const { hasPermission } = useAuth();
	const updateClaimCache = useUpdateDetailCache<ClaimDetailDto>(
		getClaimsControllerFindOneQueryKey,
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
				id: claim.id,
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
				id: claim.id,
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
			{ id: claim.id },
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
									{ id: claim.id },
									{ onSuccess: updateClaimCache },
								)
							}
						>
							Start Investigation
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
									{ id: claim.id },
									{ onSuccess: updateClaimCache },
								)
							}
						>
							Await Information
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
									{ id: claim.id },
									{ onSuccess: updateClaimCache },
								)
							}
						>
							Start Treatment
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
							Resolve Claim
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
									{ id: claim.id },
									{ onSuccess: updateClaimCache },
								)
							}
						>
							Close Ticket
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
							Reject
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
									{ id: claim.id },
									{ onSuccess: updateClaimCache },
								)
							}
						>
							Send to DTM
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
							<span className="sr-only">More actions</span>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{hasPermission(Permission.CLAIMS_UPDATE) && (
								<DropdownMenuItem
									onClick={() =>
										router.push(`/dashboard/claims/${claim.id}/edit`)
									}
								>
									Edit
								</DropdownMenuItem>
							)}

							{hasPermission(Permission.CLAIMS_DELETE) && (
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => setDeleteDialogOpen(true)}
								>
									Delete
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
						<AlertDialogTitle>Resolve claim</AlertDialogTitle>
						<AlertDialogDescription>
							Provide details summarizing how this complaint was resolved.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogBody>
						<Textarea
							value={resolutionText}
							onChange={(event) => setResolutionText(event.target.value)}
							placeholder="Resolution details..."
						/>
					</AlertDialogBody>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

						<AlertDialogAction disabled={isPending} onClick={handleResolve}>
							Confirm Resolution
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Reject Dialog */}
			<AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<AlertDialogContent size="form">
					<AlertDialogHeader>
						<AlertDialogTitle>Reject claim</AlertDialogTitle>
						<AlertDialogDescription>
							Please state the reason for rejecting this claim request.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogBody>
						<Textarea
							value={rejectionReason}
							onChange={(event) => setRejectionReason(event.target.value)}
							placeholder="Rejection reason..."
						/>
					</AlertDialogBody>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

						<AlertDialogAction disabled={isPending} onClick={handleReject}>
							Reject Claim
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete claim?"
				description="This will permanently delete this claim ticket and its interaction history. This action cannot be undone."
				confirmLabel="Delete"
				variant="destructive"
				disabled={isPending}
				onConfirm={handleDelete}
			/>
		</>
	);
}
