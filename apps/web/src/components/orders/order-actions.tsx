"use client";

import { OrderStatus, Permission } from "@ecommand/shared";
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
import { Textarea } from "@/components/ui/textarea";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import {
	getOrdersControllerFindOneQueryKey,
	useOrdersControllerApprove,
	useOrdersControllerReject,
	useOrdersControllerSendToDtm,
	useOrdersControllerSubmit,
} from "@/lib/api/orders";
import { useAuth } from "@/providers/auth-provider";

export function OrderActions({ order }: { order: OrderDetailDto }) {
	const { hasPermission } = useAuth();
	const queryClient = useQueryClient();

	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	const submitMutation = useOrdersControllerSubmit();
	const approveMutation = useOrdersControllerApprove();
	const rejectMutation = useOrdersControllerReject();
	const sendToDtmMutation = useOrdersControllerSendToDtm();

	const updateOrderCache = (updatedOrder: OrderDetailDto) => {
		queryClient.setQueryData(
			getOrdersControllerFindOneQueryKey(updatedOrder.id),
			updatedOrder,
		);
	};

	const status = order.orderStatus.name;

	const isPending =
		submitMutation.isPending ||
		approveMutation.isPending ||
		rejectMutation.isPending ||
		sendToDtmMutation.isPending;

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

	return (
		<>
			<div className="flex flex-wrap items-center gap-4">
				{hasPermission(Permission.ORDERS_UPDATE) &&
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
							Submit Order
						</Button>
					)}

				{hasPermission(Permission.ORDERS_APPROVE) &&
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
							Approve
						</Button>
					)}

				{hasPermission(Permission.ORDERS_REJECT) &&
					status === OrderStatus.SUBMITTED && (
						<Button
							variant="destructive"
							disabled={isPending}
							onClick={() => setRejectDialogOpen(true)}
						>
							Reject
						</Button>
					)}

				{hasPermission(Permission.ORDERS_EXECUTE) &&
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
							Send to DTM
						</Button>
					)}
			</div>

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
					/>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

						<AlertDialogAction
							disabled={isPending || !rejectionReason.trim()}
							onClick={handleReject}
						>
							Reject
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
