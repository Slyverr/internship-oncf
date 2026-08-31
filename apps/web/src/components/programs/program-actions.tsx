"use client";

import { Permission, ProgramStatus } from "@ecommand/shared";
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
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import {
	getProgramsControllerFindOneQueryKey,
	useProgramsControllerApprove,
	useProgramsControllerCancel,
	useProgramsControllerConfirm,
	useProgramsControllerRemove,
	useProgramsControllerSendToDtm,
	useProgramsControllerSubmit,
} from "@/lib/api/programs";
import { useAuth } from "@/providers/auth-provider";
import { ConfirmDialog } from "../common/confirm-dialog";

export function ProgramActions({ program }: { program: ProgramDetailDto }) {
	const { hasPermission } = useAuth();
	const queryClient = useQueryClient();
	const router = useRouter();

	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const submitMutation = useProgramsControllerSubmit();
	const approveMutation = useProgramsControllerApprove();
	const confirmMutation = useProgramsControllerConfirm();
	const sendToDtmMutation = useProgramsControllerSendToDtm();
	const cancelMutation = useProgramsControllerCancel();
	const removeMutation = useProgramsControllerRemove();

	const updateProgramCache = (updatedProgram: ProgramDetailDto) => {
		queryClient.setQueryData(
			getProgramsControllerFindOneQueryKey(updatedProgram.id),
			updatedProgram,
		);
	};

	const status = program.programStatus.name;

	const isPending =
		submitMutation.isPending ||
		approveMutation.isPending ||
		confirmMutation.isPending ||
		sendToDtmMutation.isPending ||
		cancelMutation.isPending ||
		removeMutation.isPending;

	const handleCancel = () => {
		cancelMutation.mutate(
			{ id: program.id },
			{
				onSuccess: (updatedProgram) => {
					updateProgramCache(updatedProgram);
					setCancelDialogOpen(false);
				},
			},
		);
	};

	const handleDelete = () => {
		removeMutation.mutate(
			{ id: program.id },
			{
				onSuccess: () => {
					setDeleteDialogOpen(false);
					router.push("/dashboard/programs");
				},
			},
		);
	};

	return (
		<>
			<div className="flex flex-wrap items-center gap-4">
				{/* Submit: DRAFT → PENDING_APPROVAL */}
				{hasPermission(Permission.PROGRAMS_ACTION_SUBMIT) &&
					status === ProgramStatus.DRAFT && (
						<Button
							disabled={isPending}
							onClick={() =>
								submitMutation.mutate(
									{ id: program.id },
									{ onSuccess: updateProgramCache },
								)
							}
						>
							{submitMutation.isPending ? "Submitting..." : "Submit Program"}
						</Button>
					)}

				{/* Approve: PENDING_APPROVAL → APPROVED */}
				{hasPermission(Permission.PROGRAMS_ACTION_APPROVE) &&
					status === ProgramStatus.PENDING_APPROVAL && (
						<Button
							variant="secondary"
							disabled={isPending}
							onClick={() =>
								approveMutation.mutate(
									{ id: program.id },
									{ onSuccess: updateProgramCache },
								)
							}
						>
							{approveMutation.isPending ? "Approving..." : "Approve"}
						</Button>
					)}

				{/* Confirm: APPROVED → CONFIRMED */}
				{hasPermission(Permission.PROGRAMS_ACTION_CONFIRM) &&
					status === ProgramStatus.APPROVED && (
						<Button
							variant="outline"
							disabled={isPending}
							onClick={() =>
								confirmMutation.mutate(
									{ id: program.id },
									{ onSuccess: updateProgramCache },
								)
							}
						>
							{confirmMutation.isPending ? "Confirming..." : "Confirm"}
						</Button>
					)}

				{/* Send to DTM: CONFIRMED → SENT_TO_DTM */}
				{hasPermission(Permission.PROGRAMS_ACTION_SEND) &&
					status === ProgramStatus.CONFIRMED && (
						<Button
							variant="outline"
							disabled={isPending}
							onClick={() =>
								sendToDtmMutation.mutate(
									{ id: program.id },
									{ onSuccess: updateProgramCache },
								)
							}
						>
							{sendToDtmMutation.isPending ? "Sending..." : "Send to DTM"}
						</Button>
					)}

				{/* Cancel: DRAFT, PENDING_APPROVAL, or APPROVED → CANCELLED */}
				{hasPermission(Permission.PROGRAMS_ACTION_CANCEL) &&
					(status === ProgramStatus.DRAFT ||
						status === ProgramStatus.PENDING_APPROVAL ||
						status === ProgramStatus.APPROVED) && (
						<Button
							variant="destructive"
							disabled={isPending}
							onClick={() => setCancelDialogOpen(true)}
						>
							{cancelMutation.isPending ? "Cancelling..." : "Cancel"}
						</Button>
					)}

				{/* More actions dropdown */}
				{(hasPermission(Permission.PROGRAMS_UPDATE) ||
					hasPermission(Permission.PROGRAMS_DELETE)) && (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={<Button variant="ghost" size="icon" />}
							disabled={isPending}
						>
							<EllipsisVerticalIcon />
							<span className="sr-only">More actions</span>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{hasPermission(Permission.PROGRAMS_UPDATE) && (
								<DropdownMenuItem
									onClick={() =>
										router.push(`/dashboard/programs/${program.id}/edit`)
									}
								>
									Edit
								</DropdownMenuItem>
							)}

							{/* Delete only allowed for DRAFT */}
							{hasPermission(Permission.PROGRAMS_DELETE) &&
								status === ProgramStatus.DRAFT && (
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

			{/* Cancel Dialog */}
			<AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel program</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to cancel this program? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>
							Keep Program
						</AlertDialogCancel>

						<AlertDialogAction
							disabled={isPending}
							onClick={handleCancel}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Cancel Program
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Confirmation */}
			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete program?"
				description="This will permanently delete this program. This action cannot be undone."
				confirmLabel="Delete"
				variant="destructive"
				disabled={isPending}
				onConfirm={handleDelete}
			/>
		</>
	);
}
