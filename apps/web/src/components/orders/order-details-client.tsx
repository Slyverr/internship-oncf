"use client";

import { Permission } from "@ecommand/shared";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { OrderActions } from "@/components/orders/order-actions";
import { OrderOverview } from "@/components/orders/order-overview";
import { Button } from "@/components/ui/button";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerFindOne } from "@/lib/api/orders";
import { canCreateProgramForOrder } from "@/lib/program-creation-eligibility";
import { useAuth } from "@/providers/auth-provider";

interface OrderDetailsClientProps {
	order: OrderDetailDto;
}

export function OrderDetailsClient({ order }: OrderDetailsClientProps) {
	const { profile, hasPermission } = useAuth();
	const { data: currentOrder } = useOrdersControllerFindOne(order.id, {
		query: {
			initialData: order,
		},
	});

	if (!currentOrder) {
		return null;
	}

	return (
		<>
			<PageHeader
				title={currentOrder.orderNumber ?? `Order #${currentOrder.id}`}
				description={currentOrder.customer.companyName}
			>
				<OrderActions order={currentOrder} />
				{canCreateProgramForOrder({
					canCreate: hasPermission(Permission.PROGRAMS_CREATE),
					canManageOther: hasPermission(Permission.ORDERS_MANAGE_OTHER),
					createdByUserId: currentOrder.createdByUserId,
					currentUserId: profile.id,
					orderStatus: currentOrder.orderStatus.name,
					programCount: currentOrder.forecastPrograms.length,
				}) && (
					<Button
						render={
							<Link
								href={
									"/dashboard/programs/new?orderId=" +
									currentOrder.id +
									"&search=" +
									encodeURIComponent(currentOrder.orderNumber)
								}
							/>
						}
					>
						<PlusIcon aria-hidden="true" />
						Create program
					</Button>
				)}
			</PageHeader>

			<OrderOverview order={currentOrder} />
		</>
	);
}
