import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OrderDetailsClient } from "@/components/orders/order-details-client";
import { ordersControllerFindOne } from "@/lib/api/orders";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const order = await ordersControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs
				items={[
					{ label: "Orders", href: "/dashboard/orders" },
					{ label: order.orderNumber ?? `#${order.id}` },
				]}
			/>

			<OrderDetailsClient order={order} />
		</>
	);
}
