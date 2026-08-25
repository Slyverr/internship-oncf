"use client";

import { Permission, ProgramStatus } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
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
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import {
	getProgramsControllerFindOneQueryKey,
	useProgramsControllerApprove,
	useProgramsControllerCancel,
	useProgramsControllerConfirm,
	useProgramsControllerSendToDtm,
	useProgramsControllerSubmit,
} from "@/lib/api/programs";
import { useAuth } from "@/providers/auth-provider";

export function ProgramActions({ program }: { program: ProgramDetailDto }) {
	const { hasPermission } = useAuth();
	const queryClient = useQueryClient();

	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

	const submitMutation = useProgramsControllerSubmit();
	const approveMutation = useProgramsControllerApprove();
	const confirmMutation = useProgramsControllerConfirm();
	const sendToDtmMutation = useProgramsControllerSendToDtm();
	const cancelMutation = useProgramsControllerCancel();

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
		cancelMutation.isPending;

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

	return (
		<>
			<div className="flex flex-wrap items-center gap-4">
				{hasPermission(Permission.PROGRAMS_UPDATE) &&
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
							Submit Program
						</Button>
					)}

				{hasPermission(Permission.PROGRAMS_APPROVE) &&
					(status === ProgramStatus.PENDING_APPROVAL ||
						status === ProgramStatus.DRAFT) && (
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
							Approve
						</Button>
					)}

				{hasPermission(Permission.PROGRAMS_EXECUTE) &&
					status === ProgramStatus.APPROVED && (
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
							Send to DTM
						</Button>
					)}

				{hasPermission(Permission.PROGRAMS_UPDATE) &&
					status === ProgramStatus.SENT_TO_DTM && (
						<Button
							disabled={isPending}
							onClick={() =>
								confirmMutation.mutate(
									{ id: program.id },
									{ onSuccess: updateProgramCache },
								)
							}
						>
							Confirm
						</Button>
					)}

				{hasPermission(Permission.PROGRAMS_UPDATE) &&
					status !== ProgramStatus.COMPLETED &&
					status !== ProgramStatus.CANCELLED && (
						<Button
							variant="destructive"
							disabled={isPending}
							onClick={() => setCancelDialogOpen(true)}
						>
							Cancel
						</Button>
					)}
			</div>

			<AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel program</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to cancel this program?
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>
							Keep Program
						</AlertDialogCancel>

						<AlertDialogAction disabled={isPending} onClick={handleCancel}>
							Cancel Program
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
