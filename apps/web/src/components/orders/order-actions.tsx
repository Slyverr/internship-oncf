"use client";

import { OrderStatus, Permission } from "@ecommand/shared";
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
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import {
	getOrdersControllerFindOneQueryKey,
	useOrdersControllerApprove,
	useOrdersControllerCancel,
	useOrdersControllerReject,
	useOrdersControllerRemove,
	useOrdersControllerSendToDtm,
	useOrdersControllerSubmit,
} from "@/lib/api/orders";
import { useAuth } from "@/providers/auth-provider";
import { ConfirmDialog } from "../common/confirm-dialog";

export function OrderActions({ order }: { order: OrderDetailDto }) {
	const { hasPermission } = useAuth();
	const queryClient = useQueryClient();
	const router = useRouter();

	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	const submitMutation = useOrdersControllerSubmit();
	const approveMutation = useOrdersControllerApprove();
	const rejectMutation = useOrdersControllerReject();
	const cancelMutation = useOrdersControllerCancel();
	const sendToDtmMutation = useOrdersControllerSendToDtm();
	const removeMutation = useOrdersControllerRemove();

	const updateOrderCache = (updatedOrder: OrderDetailDto) => {
		queryClient.setQueryData(
			getOrdersControllerFindOneQueryKey(updatedOrder.id),
			updatedOrder,
		);
	};

	const status = order.orderStatus.name;

	const canEdit =
		status === OrderStatus.DRAFT && hasPermission(Permission.ORDERS_UPDATE);

	const canDelete =
		status === OrderStatus.DRAFT && hasPermission(Permission.ORDERS_DELETE);

	const isPending =
		submitMutation.isPending ||
		approveMutation.isPending ||
		rejectMutation.isPending ||
		cancelMutation.isPending ||
		sendToDtmMutation.isPending ||
		removeMutation.isPending;

	const handleReject = () => {
		rejectMutation.mutate(
			{
				id: order.id,
				data: {
					reason: rejectionReason,
				},
			},
			{
				onSuccess: (updatedOrder) => {
					updateOrderCache(updatedOrder);
					setRejectDialogOpen(false);
					setRejectionReason("");
				},
			},
		);
	};

	const handleDelete = () => {
		removeMutation.mutate(
			{ id: order.id },
			{
				onSuccess: () => {
					setDeleteDialogOpen(false);
					router.push("/dashboard/orders");
				},
			},
		);
	};

	return (
		<>
			<div className="flex flex-wrap items-center gap-4">
				{/* Submit: DRAFT → SUBMITTED */}
				{hasPermission(Permission.ORDERS_ACTION_SUBMIT) &&
					status === OrderStatus.DRAFT && (
						<Button
							disabled={isPending}
							onClick={() =>
								submitMutation.mutate(
									{ id: order.id },
									{ onSuccess: updateOrderCache },
								)
							}
						>
							{submitMutation.isPending ? "Submitting..." : "Submit Order"}
						</Button>
					)}

				{/* Approve: SUBMITTED → APPROVED */}
				{hasPermission(Permission.ORDERS_ACTION_APPROVE) &&
					status === OrderStatus.SUBMITTED && (
						<Button
							variant="secondary"
							disabled={isPending}
							onClick={() =>
								approveMutation.mutate(
									{ id: order.id },
									{ onSuccess: updateOrderCache },
								)
							}
						>
							{approveMutation.isPending ? "Approving..." : "Approve"}
						</Button>
					)}

				{/* Reject: SUBMITTED → REJECTED */}
				{hasPermission(Permission.ORDERS_ACTION_REJECT) &&
					status === OrderStatus.SUBMITTED && (
						<Button
							variant="destructive"
							disabled={isPending}
							onClick={() => setRejectDialogOpen(true)}
						>
							Reject
						</Button>
					)}

				{/* Cancel: DRAFT or SUBMITTED → CANCELLED */}
				{hasPermission(Permission.ORDERS_ACTION_CANCEL) &&
					(status === OrderStatus.DRAFT ||
						status === OrderStatus.SUBMITTED) && (
						<Button
							variant="outline"
							disabled={isPending}
							onClick={() =>
								cancelMutation.mutate(
									{ id: order.id },
									{ onSuccess: updateOrderCache },
								)
							}
						>
							{cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
						</Button>
					)}

				{/* Send to DTM: APPROVED → SENT_TO_DTM */}
				{hasPermission(Permission.ORDERS_ACTION_SEND_TO_DTM) &&
					status === OrderStatus.APPROVED && (
						<Button
							variant="outline"
							disabled={isPending}
							onClick={() =>
								sendToDtmMutation.mutate(
									{ id: order.id },
									{ onSuccess: updateOrderCache },
								)
							}
						>
							{sendToDtmMutation.isPending ? "Sending..." : "Send to DTM"}
						</Button>
					)}

				{/* Show the dropdown only when an action is available. */}
				{(canEdit || canDelete) && (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={<Button variant="ghost" size="icon" />}
							disabled={isPending}
						>
							<EllipsisVerticalIcon />
							<span className="sr-only">More actions</span>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{canEdit && (
								<DropdownMenuItem
									onClick={() =>
										router.push(`/dashboard/orders/${order.id}/edit`)
									}
								>
									Edit
								</DropdownMenuItem>
							)}

							{canDelete && (
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

			{/* Reject Dialog */}
			<AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Reject order</AlertDialogTitle>
						<AlertDialogDescription>
							Please provide a reason for rejecting this order.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<Textarea
						value={rejectionReason}
						onChange={(event) => setRejectionReason(event.target.value)}
						placeholder="Rejection reason"
						className="min-h-25"
					/>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

						<AlertDialogAction
							disabled={isPending || !rejectionReason.trim()}
							onClick={handleReject}
						>
							{rejectMutation.isPending ? "Rejecting..." : "Reject"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Confirmation */}
			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title="Delete order?"
				description="This will permanently delete this order. This action cannot be undone."
				confirmLabel="Delete"
				variant="destructive"
				disabled={isPending}
				onConfirm={handleDelete}
			/>
		</>
	);
}
