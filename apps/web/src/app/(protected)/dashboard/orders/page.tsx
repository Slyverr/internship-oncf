import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { OrdersTable } from "@/components/orders/orders-table";
import { buttonVariants } from "@/components/ui/button";
import { ordersControllerFindAll } from "@/lib/api/orders";

export default async function Page() {
	const orders = await ordersControllerFindAll();

	return (
		<>
			<Breadcrumbs items={[{ label: "Orders", href: "/dashboard/orders" }]} />

			<PageHeader title="Orders" description="Manage and edit customer orders.">
				<Link className={buttonVariants()} href="/dashboard/orders/new">
					<PlusIcon />
					Create Order
				</Link>
			</PageHeader>

			<OrdersTable data={orders} />
		</>
	);
}
