"use client";

import { ClaimStatus, Permission } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import { EllipsisVerticalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
	getClaimsControllerFindOneQueryKey,
	useClaimsControllerClose,
	useClaimsControllerReject,
	useClaimsControllerRemove,
	useClaimsControllerResolve,
	useClaimsControllerStartProgress,
} from "@/lib/api/claims";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";
import { useAuth } from "@/providers/auth-provider";
import { ConfirmDialog } from "../common/confirm-dialog";

export function ClaimActions({ claim }: { claim: ClaimDetailDto }) {
	const { hasPermission } = useAuth();
	const queryClient = useQueryClient();
	const router = useRouter();

	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const [rejectionReason, setRejectionReason] = useState("");
	const [resolutionText, setResolutionText] = useState("");

	const startProgressMutation = useClaimsControllerStartProgress();
	const resolveMutation = useClaimsControllerResolve();
	const closeMutation = useClaimsControllerClose();
	const rejectMutation = useClaimsControllerReject();
	const removeMutation = useClaimsControllerRemove();

	const updateClaimCache = (updatedClaim: ClaimDetailDto) => {
		queryClient.setQueryData(
			getClaimsControllerFindOneQueryKey(updatedClaim.id),
			updatedClaim,
		);
	};

	const status = claim.claimStatus?.name;

	const isPending =
		startProgressMutation.isPending ||
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
				{hasPermission(Permission.CLAIMS_MANAGE_OTHER) &&
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

				{/* Resolve: IN_PROGRESS / AWAITING_INFO -> RESOLVED */}
				{hasPermission(Permission.CLAIMS_MANAGE_OTHER) &&
					(status === ClaimStatus.IN_PROGRESS ||
						status === ClaimStatus.IN_TREATMENT ||
						status === ClaimStatus.AWAITING_INFO) && (
						<Button
							variant="secondary"
							disabled={isPending}
							onClick={() => setResolveDialogOpen(true)}
						>
							Resolve Claim
						</Button>
					)}

				{/* Close: RESOLVED -> CLOSED */}
				{hasPermission(Permission.CLAIMS_MANAGE_OTHER) &&
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

				{/* Reject: NEW / IN_PROGRESS -> REJECTED */}
				{hasPermission(Permission.CLAIMS_MANAGE_OTHER) &&
					status !== ClaimStatus.CLOSED &&
					status !== ClaimStatus.REJECTED && (
						<Button
							variant="destructive"
							disabled={isPending}
							onClick={() => setRejectDialogOpen(true)}
						>
							Reject
						</Button>
					)}

				{/* Dropdown Menu for Edit and Delete */}
				{(hasPermission(Permission.CLAIMS_MANAGE_OTHER) ||
					hasPermission(Permission.CLAIMS_DELETE)) && (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={<Button variant="ghost" size="icon" />}
							disabled={isPending}
						>
							<EllipsisVerticalIcon />
							<span className="sr-only">More actions</span>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{hasPermission(Permission.CLAIMS_MANAGE_OTHER) && (
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
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Resolve claim</AlertDialogTitle>
						<AlertDialogDescription>
							Provide details summarizing how this complaint was resolved.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<Textarea
						value={resolutionText}
						onChange={(event) => setResolutionText(event.target.value)}
						placeholder="Resolution details..."
					/>

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
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Reject claim</AlertDialogTitle>
						<AlertDialogDescription>
							Please state the reason for rejecting this claim request.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<Textarea
						value={rejectionReason}
						onChange={(event) => setRejectionReason(event.target.value)}
						placeholder="Rejection reason..."
					/>

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
