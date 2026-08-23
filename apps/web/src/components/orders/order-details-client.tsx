"use client";

import { PageHeader } from "@/components/common/page-header";
import { OrderActions } from "@/components/orders/order-actions";
import { OrderOverview } from "@/components/orders/order-overview";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerFindOne } from "@/lib/api/orders";

interface OrderDetailsClientProps {
	order: OrderDetailDto;
}

export function OrderDetailsClient({ order }: OrderDetailsClientProps) {
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
			</PageHeader>

			<OrderOverview order={currentOrder} />
		</>
	);
}
