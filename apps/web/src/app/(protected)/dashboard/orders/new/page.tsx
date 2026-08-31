import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OrderCreateForm } from "@/components/orders/order-create-form";
import { ordersBreadcrumbs } from "../breadcrumbs";

export default function Page() {
	return (
		<>
			<Breadcrumbs items={ordersBreadcrumbs.create()} />

			<OrderCreateForm />
		</>
	);
}
