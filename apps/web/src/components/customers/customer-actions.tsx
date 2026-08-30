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
import {
	getCustomersControllerFindOneQueryKey,
	useCustomersControllerDeactivate,
} from "@/lib/api/customers";
import type { CustomerDetailDto } from "@/lib/api/generated.schemas";
import { useAuth } from "@/providers/auth-provider";

export function CustomerActions({ customer }: { customer: CustomerDetailDto }) {
	const { hasPermission } = useAuth();
	const queryClient = useQueryClient();
	const router = useRouter();

	const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
	const deactivateMutation = useCustomersControllerDeactivate();

	const handleDeactivate = () => {
		deactivateMutation.mutate(
			{ id: customer.id },
			{
				onSuccess: () => {
					setDeactivateDialogOpen(false);
					queryClient.invalidateQueries({
						queryKey: getCustomersControllerFindOneQueryKey(customer.id),
					});
					router.push("/dashboard/customers");
				},
			},
		);
	};

	const canUpdate = hasPermission(Permission.CUSTOMERS_UPDATE);
	const canDeactivate = hasPermission(Permission.CUSTOMERS_DELETE);

	if (!canUpdate && !canDeactivate) return null;

	return (
		<>
			<div className="flex flex-wrap items-center gap-4">
				{canUpdate && (
					<Button
						variant="outline"
						onClick={() =>
							router.push(`/dashboard/customers/${customer.id}/edit`)
						}
					>
						Edit Customer
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
								Deactivate Customer
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<ConfirmDialog
				open={deactivateDialogOpen}
				onOpenChange={setDeactivateDialogOpen}
				title="Deactivate Customer?"
				description="Are you sure you want to deactivate this customer profile?"
				confirmLabel="Deactivate"
				variant="destructive"
				disabled={deactivateMutation.isPending}
				onConfirm={handleDeactivate}
			/>
		</>
	);
}
