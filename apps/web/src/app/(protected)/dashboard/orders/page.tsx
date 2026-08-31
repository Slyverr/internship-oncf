import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { OrdersTable } from "@/components/orders/orders-table";
import { buttonVariants } from "@/components/ui/button";
import { OrdersControllerFindAllParams } from "@/lib/api/generated.schemas";
import { ordersControllerFindAll } from "@/lib/api/orders";
import { ordersBreadcrumbs } from "./breadcrumbs";

interface PageProps {
	searchParams: Promise<OrdersControllerFindAllParams>;
}

export default async function Page({ searchParams }: PageProps) {
	const query = await searchParams;
	const orders = await ordersControllerFindAll(query);

	return (
		<>
			<Breadcrumbs items={ordersBreadcrumbs.home()} />

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
