import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OrderDetailsClient } from "@/components/orders/order-details-client";
import { ordersControllerFindOne } from "@/lib/api/orders";
import { ordersBreadcrumbs } from "../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const order = await ordersControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs
				items={ordersBreadcrumbs.detail(
					id,
					order.orderNumber ?? `#${order.id}`,
				)}
			/>

			<OrderDetailsClient order={order} />
		</>
	);
}
