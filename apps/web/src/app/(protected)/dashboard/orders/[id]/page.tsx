import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OrderActions } from "@/components/orders/order-actions";
import { OrderDetails } from "@/components/orders/order-details";
import { OrderDetailDto } from "@/lib/api/generated.schemas";
import { ordersControllerFindOne } from "@/lib/api/orders";

interface PageProps {
	params: Promise<{
		id: OrderDetailDto["id"];
	}>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;

	const order = await ordersControllerFindOne(id);

	return (
		<>
			<Breadcrumbs
				items={[
					{ label: "Orders", href: "/dashboard/orders" },
					{ label: `#${id}` },
				]}
			/>

			<OrderDetails order={order} />
			<OrderActions order={order} />
		</>
	);
}
