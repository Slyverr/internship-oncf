"use client";

import { Permission } from "@ecommand/shared";
import { PlusIcon, PrinterIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { OrderActions } from "@/components/orders/order-actions";
import { OrderOverview } from "@/components/orders/order-overview";
import { Button, buttonVariants } from "@/components/ui/button";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerFindOne } from "@/lib/api/orders";
import { canCreateProgramForOrder } from "@/lib/program-creation-eligibility";
import { useAuth } from "@/providers/auth-provider";
import { useRealtimeConnected } from "@/providers/realtime-provider";
import { OrderPrintDocument } from "./order-print-document";

interface OrderDetailsClientProps {
	order: OrderDetailDto;
}

export function OrderDetailsClient({ order }: OrderDetailsClientProps) {
	const t = useTranslate();
	const { profile, hasPermission } = useAuth();
	const realtimeConnected = useRealtimeConnected();
	const { data: currentOrder } = useOrdersControllerFindOne(order.orderNumber, {
		query: {
			initialData: order,
			refetchInterval: (query) =>
				!realtimeConnected && query.state.data?.dtmRequestStatus === "PENDING"
					? 1_000
					: false,
		},
	});

	if (!currentOrder) {
		return null;
	}

	return (
		<>
			<PageHeader
				title={currentOrder.orderNumber}
				description={currentOrder.customer.companyName}
			>
				{hasPermission(Permission.ORDERS_READ) && (
					<Button
						className="print:hidden"
						variant="outline"
						onClick={() => window.print()}
					>
						<PrinterIcon aria-hidden="true" />
						{t(Messages.orders.detail.printPdf)}
					</Button>
				)}
				<OrderActions order={currentOrder} />
				{canCreateProgramForOrder({
					canCreate: hasPermission(Permission.PROGRAMS_CREATE),
					canManageOther: hasPermission(Permission.ORDERS_MANAGE_OTHER),
					createdByUserId: currentOrder.createdByUserId,
					currentUserId: profile.id,
					orderStatus: currentOrder.orderStatus.name,
					programCount: currentOrder.forecastPrograms.length,
				}) && (
					<Link
						className={buttonVariants()}
						href={
							"/dashboard/programs/new?orderNumber=" +
							currentOrder.orderNumber +
							"&search=" +
							encodeURIComponent(currentOrder.orderNumber)
						}
					>
						<PlusIcon aria-hidden="true" />
						{t(Messages.orders.detail.createProgram)}
					</Link>
				)}
			</PageHeader>

			<div className="print:hidden">
				<OrderOverview order={currentOrder} />
			</div>
			<OrderPrintDocument order={currentOrder} />
		</>
	);
}
