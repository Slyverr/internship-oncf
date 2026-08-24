import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OrderCreateForm } from "@/components/orders/order-create-form";

export default function Page() {
	return (
		<>
			<Breadcrumbs
				items={[
					{ label: "Orders", href: "/dashboard/orders" },
					{ label: "New Order" },
				]}
			/>

			<OrderCreateForm />
		</>
	);
}
