"use client";

import { Permission } from "@ecommand/shared";
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
import { hasAvailableActions } from "@/lib/action-visibility";
import {
	getCustomersControllerFindOneQueryKey,
	useCustomersControllerDeactivate,
} from "@/lib/api/customers";
import type { CustomerDetailDto } from "@/lib/api/generated.schemas";
import { useAuth } from "@/providers/auth-provider";

export function CustomerActions({ customer }: { customer: CustomerDetailDto }) {
	const t = useTranslate();
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

	if (!hasAvailableActions(canUpdate, canDeactivate)) return null;

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
						{t(Messages.customers.detail.edit)}
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
							<span className="sr-only">
								{t(Messages.customers.detail.moreActions)}
							</span>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{canDeactivate && (
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => setDeactivateDialogOpen(true)}
								>
									{t(Messages.customers.detail.deactivate)}
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			<ConfirmDialog
				open={deactivateDialogOpen}
				onOpenChange={setDeactivateDialogOpen}
				title={t(Messages.customers.detail.deactivateTitle)}
				description={t(Messages.customers.detail.deactivateDescription)}
				confirmLabel={t(Messages.customers.detail.deactivate)}
				variant="destructive"
				disabled={deactivateMutation.isPending}
				onConfirm={handleDeactivate}
			/>
		</>
	);
}
