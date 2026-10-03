"use client";

import { Permission, RolePersona } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import { EllipsisVerticalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import {
	canReviewRegistration,
	hasAvailableActions,
} from "@/lib/action-visibility";
import {
	ReviewUserRegistrationDtoStatus,
	type UserDetailDto,
} from "@/lib/api/generated.schemas";
import {
	getUsersControllerFindAllQueryKey,
	getUsersControllerFindOneQueryKey,
	useUsersControllerDeactivate,
	useUsersControllerReviewRegistration,
} from "@/lib/api/users";
import { useAuth } from "@/providers/auth-provider";

export function UserActions({ user }: { user: UserDetailDto }) {
	const t = useTranslate();
	const { hasPermission } = useAuth();
	const queryClient = useQueryClient();
	const router = useRouter();

	const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const deactivateMutation = useUsersControllerDeactivate();
	const reviewMutation = useUsersControllerReviewRegistration();

	const handleDeactivate = () => {
		deactivateMutation.mutate(
			{ id: user.id },
			{
				onSuccess: () => {
					setDeactivateDialogOpen(false);
					queryClient.invalidateQueries({
						queryKey: getUsersControllerFindOneQueryKey(user.id),
					});
					router.push("/dashboard/users");
				},
			},
		);
	};

	const canUpdate = hasPermission(Permission.USERS_UPDATE);
	const canDeactivate = hasPermission(Permission.USERS_DELETE);
	const canReview = canReviewRegistration(
		user.registrationStatus,
		canUpdate,
		user.role?.persona === RolePersona.CLIENT_REPRESENTATIVE,
	);

	const reviewRegistration = (
		status:
			| typeof ReviewUserRegistrationDtoStatus.APPROVED
			| typeof ReviewUserRegistrationDtoStatus.REJECTED,
	) => {
		reviewMutation.mutate(
			{ id: user.id, data: { status } },
			{
				onSuccess: (updatedUser) => {
					setRejectDialogOpen(false);
					queryClient.setQueryData(
						getUsersControllerFindOneQueryKey(user.id),
						updatedUser,
					);
					queryClient.invalidateQueries({
						queryKey: getUsersControllerFindAllQueryKey(),
					});
				},
			},
		);
	};

	if (!hasAvailableActions(canUpdate, canDeactivate)) return null;

	return (
		<>
			<div className="flex flex-wrap items-center gap-2">
				{canReview && (
					<>
						<Button
							onClick={() =>
								reviewRegistration(ReviewUserRegistrationDtoStatus.APPROVED)
							}
							disabled={reviewMutation.isPending}
						>
							{t(Messages.users.actions.approve)}
						</Button>
						<Button
							variant="outline"
							onClick={() => setRejectDialogOpen(true)}
							disabled={reviewMutation.isPending}
						>
							{t(Messages.users.actions.reject)}
						</Button>
					</>
				)}

				{canUpdate && (
					<Button
						variant="outline"
						onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}
					>
						{t(Messages.users.actions.editUser)}
					</Button>
				)}

				{hasAvailableActions(canDeactivate) && (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<button
									type="button"
									className={buttonVariants({ variant: "ghost", size: "icon" })}
								/>
							}
							disabled={deactivateMutation.isPending}
						>
							<EllipsisVerticalIcon />
							<span className="sr-only">{t(Messages.users.actions.more)}</span>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{canDeactivate && (
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => setDeactivateDialogOpen(true)}
								>
									{t(Messages.users.actions.deactivate)}
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			<ConfirmDialog
				open={rejectDialogOpen}
				onOpenChange={setRejectDialogOpen}
				title={t(Messages.users.actions.rejectTitle)}
				description={t(Messages.users.actions.rejectDescription, {
					name: `${user.firstName} ${user.lastName}`,
				})}
				confirmLabel={t(Messages.users.actions.reject)}
				variant="destructive"
				disabled={reviewMutation.isPending}
				onConfirm={() =>
					reviewRegistration(ReviewUserRegistrationDtoStatus.REJECTED)
				}
			/>

			<ConfirmDialog
				open={deactivateDialogOpen}
				onOpenChange={setDeactivateDialogOpen}
				title={t(Messages.users.actions.deactivateTitle)}
				description={t(Messages.users.actions.deactivateDescription, {
					name: `${user.firstName} ${user.lastName}`,
				})}
				confirmLabel={t(Messages.users.actions.deactivate)}
				variant="destructive"
				disabled={deactivateMutation.isPending}
				onConfirm={handleDeactivate}
			/>
		</>
	);
}
