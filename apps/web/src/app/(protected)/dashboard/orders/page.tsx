import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { OrdersTable } from "@/components/orders/orders-table";
import { ordersControllerFindAll } from "@/lib/api/orders";

export default async function Page() {
	const orders = await ordersControllerFindAll();

	return (
		<>
			<Breadcrumbs items={[{ label: "Orders", href: "/dashboard/orders" }]} />

			<PageHeader
				title="Orders"
				description="Manage and edit customer orders."
			/>

			<OrdersTable data={orders} />
		</>
	);
}
