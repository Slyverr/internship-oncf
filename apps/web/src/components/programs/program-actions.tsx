"use client";

import {
	isWorkflowTransitionAllowed,
	Permission,
	PROGRAM_TRANSITIONS,
	ProgramStatus,
} from "@ecommand/shared";
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
import { useUpdateDetailCache } from "@/hooks/use-update-detail-cache";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { canDeleteProgram, hasAvailableActions } from "@/lib/action-visibility";
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
	const t = useTranslate();
	const { hasPermission } = useAuth();
	const updateProgramCache = useUpdateDetailCache<ProgramDetailDto, string>(
		getProgramsControllerFindOneQueryKey,
		(program) => program.programNumber,
	);
	const router = useRouter();

	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const submitMutation = useProgramsControllerSubmit();
	const approveMutation = useProgramsControllerApprove();
	const confirmMutation = useProgramsControllerConfirm();
	const sendToDtmMutation = useProgramsControllerSendToDtm();
	const cancelMutation = useProgramsControllerCancel();
	const removeMutation = useProgramsControllerRemove();

	const status = program.programStatus.name;
	const canEdit = hasPermission(Permission.PROGRAMS_UPDATE);
	const canDelete = canDeleteProgram(
		status,
		hasPermission(Permission.PROGRAMS_DELETE),
	);

	const isPending =
		submitMutation.isPending ||
		approveMutation.isPending ||
		confirmMutation.isPending ||
		sendToDtmMutation.isPending ||
		cancelMutation.isPending ||
		removeMutation.isPending;

	const handleCancel = () => {
		cancelMutation.mutate(
			{ id: program.programNumber },
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
			{ id: program.programNumber },
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
					isWorkflowTransitionAllowed(
						PROGRAM_TRANSITIONS,
						status,
						ProgramStatus.PENDING_APPROVAL,
					) && (
						<Button
							disabled={isPending}
							onClick={() =>
								submitMutation.mutate(
									{ id: program.programNumber },
									{ onSuccess: updateProgramCache },
								)
							}
						>
							{t(
								submitMutation.isPending
									? Messages.programs.actions.submitting
									: Messages.programs.actions.submit,
							)}
						</Button>
					)}

				{/* Approve: PENDING_APPROVAL → APPROVED */}
				{hasPermission(Permission.PROGRAMS_ACTION_APPROVE) &&
					isWorkflowTransitionAllowed(
						PROGRAM_TRANSITIONS,
						status,
						ProgramStatus.APPROVED,
					) && (
						<Button
							variant="secondary"
							disabled={isPending}
							onClick={() =>
								approveMutation.mutate(
									{ id: program.programNumber },
									{ onSuccess: updateProgramCache },
								)
							}
						>
							{t(
								approveMutation.isPending
									? Messages.programs.actions.approving
									: Messages.programs.actions.approve,
							)}
						</Button>
					)}

				{/* Confirm: APPROVED → CONFIRMED */}
				{hasPermission(Permission.PROGRAMS_ACTION_CONFIRM) &&
					isWorkflowTransitionAllowed(
						PROGRAM_TRANSITIONS,
						status,
						ProgramStatus.CONFIRMED,
					) && (
						<Button
							variant="outline"
							disabled={isPending}
							onClick={() =>
								confirmMutation.mutate(
									{ id: program.programNumber },
									{ onSuccess: updateProgramCache },
								)
							}
						>
							{t(
								confirmMutation.isPending
									? Messages.programs.actions.confirming
									: Messages.programs.actions.confirm,
							)}
						</Button>
					)}

				{/* Send to DTM: CONFIRMED → SENT_TO_DTM */}
				{hasPermission(Permission.PROGRAMS_ACTION_SEND) &&
					isWorkflowTransitionAllowed(
						PROGRAM_TRANSITIONS,
						status,
						ProgramStatus.SENT_TO_DTM,
					) && (
						<Button
							variant="outline"
							disabled={isPending}
							onClick={() =>
								sendToDtmMutation.mutate(
									{ id: program.programNumber },
									{ onSuccess: updateProgramCache },
								)
							}
						>
							{t(
								sendToDtmMutation.isPending
									? Messages.programs.actions.sending
									: Messages.programs.actions.sendToDtm,
							)}
						</Button>
					)}

				{/* Cancel: follow every transition accepted by the API. */}
				{hasPermission(Permission.PROGRAMS_ACTION_CANCEL) &&
					isWorkflowTransitionAllowed(
						PROGRAM_TRANSITIONS,
						status,
						ProgramStatus.CANCELLED,
					) && (
						<Button
							variant="destructive"
							disabled={isPending}
							onClick={() => setCancelDialogOpen(true)}
						>
							{t(
								cancelMutation.isPending
									? Messages.programs.actions.cancelling
									: Messages.programs.actions.cancel,
							)}
						</Button>
					)}

				{/* More actions dropdown */}
				{hasAvailableActions(canEdit, canDelete) && (
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
							<span className="sr-only">
								{t(Messages.programs.actions.more)}
							</span>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{canEdit && (
								<DropdownMenuItem
									onClick={() =>
										router.push(
											`/dashboard/programs/${program.programNumber}/edit`,
										)
									}
								>
									{t(Messages.programs.actions.edit)}
								</DropdownMenuItem>
							)}

							{/* Delete only allowed for DRAFT */}
							{canDelete && (
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => setDeleteDialogOpen(true)}
								>
									{t(Messages.programs.actions.delete)}
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
						<AlertDialogTitle>
							{t(Messages.programs.actions.cancelTitle)}
						</AlertDialogTitle>
					</AlertDialogHeader>
					<AlertDialogBody>
						<AlertDialogDescription>
							{t(Messages.programs.actions.cancelDescription)}
						</AlertDialogDescription>
					</AlertDialogBody>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>
							{t(Messages.programs.actions.keepProgram)}
						</AlertDialogCancel>

						<AlertDialogAction
							disabled={isPending}
							onClick={handleCancel}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{t(Messages.programs.actions.cancelProgram)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Confirmation */}
			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title={t(Messages.programs.actions.deleteTitle)}
				description={t(Messages.programs.actions.deleteDescription)}
				confirmLabel={t(Messages.programs.actions.delete)}
				variant="destructive"
				disabled={isPending}
				onConfirm={handleDelete}
			/>
		</>
	);
}
