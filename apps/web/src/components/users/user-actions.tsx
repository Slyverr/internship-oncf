"use client";

import { Permission } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import { EllipsisVerticalIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserDetailDto } from "@/lib/api/generated.schemas";

import {
	getUsersControllerFindOneQueryKey,
	useUsersControllerDeactivate,
} from "@/lib/api/users";
import { useAuth } from "@/providers/auth-provider";

export function UserActions({ user }: { user: UserDetailDto }) {
	const { hasPermission } = useAuth();
	const queryClient = useQueryClient();
	const router = useRouter();

	const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
	const deactivateMutation = useUsersControllerDeactivate();

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

	if (!canUpdate && !canDeactivate) return null;

	return (
		<>
			<div className="flex flex-wrap items-center gap-4">
				{canUpdate && (
					<Button
						variant="outline"
						onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}
					>
						Edit User
					</Button>
				)}

				<DropdownMenu>
					<DropdownMenuTrigger
						render={<Button variant="ghost" size="icon" />}
						disabled={deactivateMutation.isPending}
					>
						<EllipsisVerticalIcon />
						<span className="sr-only">More actions</span>
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						{canDeactivate && (
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => setDeactivateDialogOpen(true)}
							>
								Deactivate User
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<ConfirmDialog
				open={deactivateDialogOpen}
				onOpenChange={setDeactivateDialogOpen}
				title="Deactivate User Account?"
				description={`Are you sure you want to deactivate the user account for ${user.firstName} ${user.lastName}?`}
				confirmLabel="Deactivate"
				variant="destructive"
				disabled={deactivateMutation.isPending}
				onConfirm={handleDeactivate}
			/>
		</>
	);
}
