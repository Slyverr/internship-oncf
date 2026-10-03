"use client";

import {
	isWorkflowTransitionAllowed,
	ORDER_TRANSITIONS,
	OrderStatus,
	Permission,
} from "@ecommand/shared";
import { useMutation } from "@tanstack/react-query";
import { CopyIcon, EllipsisVerticalIcon } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateDetailCache } from "@/hooks/use-update-detail-cache";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { canSubmitRequiredText } from "@/lib/action-visibility";
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
import { customFetch } from "@/lib/axios";
import { useAuth } from "@/providers/auth-provider";
import { ConfirmDialog } from "../common/confirm-dialog";

export function OrderActions({ order }: { order: OrderDetailDto }) {
	const t = useTranslate();
	const { hasPermission } = useAuth();
	const updateOrderCache = useUpdateDetailCache<OrderDetailDto, string>(
		getOrdersControllerFindOneQueryKey,
		(order) => order.orderNumber,
	);
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
	const duplicateMutation = useMutation({
		mutationFn: () =>
			customFetch<OrderDetailDto>({
				url: `/orders/${order.orderNumber}/duplicate`,
				method: "POST",
			}),
		onSuccess: (duplicatedOrder) =>
			router.push(`/dashboard/orders/${duplicatedOrder.orderNumber}`),
	});

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
				id: order.orderNumber,
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
			{ id: order.orderNumber },
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
				{hasPermission(Permission.ORDERS_CREATE) && (
					<Button
						variant="outline"
						disabled={duplicateMutation.isPending}
						onClick={() => duplicateMutation.mutate()}
					>
						<CopyIcon aria-hidden="true" />
						{t(Messages.orders.detail.duplicate)}
					</Button>
				)}
				{duplicateMutation.isError && (
					<p className="basis-full text-sm text-destructive" role="alert">
						{t(Messages.orders.detail.duplicateFailed)}
					</p>
				)}
				{/* Submit: DRAFT → SUBMITTED */}
				{hasPermission(Permission.ORDERS_ACTION_SUBMIT) &&
					isWorkflowTransitionAllowed(
						ORDER_TRANSITIONS,
						status,
						OrderStatus.SUBMITTED,
					) && (
						<Button
							disabled={isPending}
							onClick={() =>
								submitMutation.mutate(
									{ id: order.orderNumber },
									{ onSuccess: updateOrderCache },
								)
							}
						>
							{t(
								submitMutation.isPending
									? Messages.orders.actions.submitting
									: Messages.orders.actions.submit,
							)}
						</Button>
					)}

				{/* Approve: SUBMITTED → APPROVED */}
				{hasPermission(Permission.ORDERS_ACTION_APPROVE) &&
					isWorkflowTransitionAllowed(
						ORDER_TRANSITIONS,
						status,
						OrderStatus.APPROVED,
					) && (
						<Button
							variant="secondary"
							disabled={isPending}
							onClick={() =>
								approveMutation.mutate(
									{ id: order.orderNumber },
									{ onSuccess: updateOrderCache },
								)
							}
						>
							{t(
								approveMutation.isPending
									? Messages.orders.actions.approving
									: Messages.orders.actions.approve,
							)}
						</Button>
					)}

				{/* Reject: SUBMITTED → REJECTED */}
				{hasPermission(Permission.ORDERS_ACTION_REJECT) &&
					isWorkflowTransitionAllowed(
						ORDER_TRANSITIONS,
						status,
						OrderStatus.REJECTED,
					) && (
						<Button
							variant="destructive"
							disabled={isPending}
							onClick={() => setRejectDialogOpen(true)}
						>
							{t(Messages.orders.actions.reject)}
						</Button>
					)}

				{/* Cancel: follow every transition accepted by the API. */}
				{hasPermission(Permission.ORDERS_ACTION_CANCEL) &&
					isWorkflowTransitionAllowed(
						ORDER_TRANSITIONS,
						status,
						OrderStatus.CANCELLED,
					) && (
						<Button
							variant="outline"
							disabled={isPending}
							onClick={() =>
								cancelMutation.mutate(
									{ id: order.orderNumber },
									{ onSuccess: updateOrderCache },
								)
							}
						>
							{t(
								cancelMutation.isPending
									? Messages.orders.actions.cancelling
									: Messages.orders.actions.cancel,
							)}
						</Button>
					)}

				{/* Send to DTM: APPROVED → SENT_TO_DTM */}
				{hasPermission(Permission.ORDERS_ACTION_SEND_TO_DTM) &&
					isWorkflowTransitionAllowed(
						ORDER_TRANSITIONS,
						status,
						OrderStatus.SENT_TO_DTM,
					) && (
						<Button
							variant="outline"
							disabled={isPending}
							onClick={() =>
								sendToDtmMutation.mutate(
									{ id: order.orderNumber },
									{ onSuccess: updateOrderCache },
								)
							}
						>
							{t(
								sendToDtmMutation.isPending
									? Messages.orders.actions.sending
									: Messages.orders.actions.sendToDtm,
							)}
						</Button>
					)}

				{/* Show the dropdown only when an action is available. */}
				{(canEdit || canDelete) && (
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
							<span className="sr-only">{t(Messages.orders.actions.more)}</span>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{canEdit && (
								<DropdownMenuItem
									onClick={() =>
										router.push(`/dashboard/orders/${order.orderNumber}/edit`)
									}
								>
									{t(Messages.orders.actions.edit)}
								</DropdownMenuItem>
							)}

							{canDelete && (
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => setDeleteDialogOpen(true)}
								>
									{t(Messages.orders.actions.delete)}
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			{/* Reject Dialog */}
			<AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<AlertDialogContent size="form">
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t(Messages.orders.actions.rejectTitle)}
						</AlertDialogTitle>
						<AlertDialogDescription>
							{t(Messages.orders.actions.rejectDescription)}
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogBody>
						<Textarea
							value={rejectionReason}
							onChange={(event) => setRejectionReason(event.target.value)}
							placeholder={t(Messages.orders.actions.rejectionPlaceholder)}
							className="min-h-25"
						/>
					</AlertDialogBody>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>
							{t(Messages.orders.actions.cancelAction)}
						</AlertDialogCancel>

						<AlertDialogAction
							disabled={!canSubmitRequiredText(rejectionReason, isPending)}
							onClick={handleReject}
						>
							{t(
								rejectMutation.isPending
									? Messages.orders.actions.rejecting
									: Messages.orders.actions.reject,
							)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Confirmation */}
			<ConfirmDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				title={t(Messages.orders.actions.deleteTitle)}
				description={t(Messages.orders.actions.deleteDescription)}
				confirmLabel={t(Messages.orders.actions.delete)}
				variant="destructive"
				disabled={isPending}
				onConfirm={handleDelete}
			/>
		</>
	);
}
