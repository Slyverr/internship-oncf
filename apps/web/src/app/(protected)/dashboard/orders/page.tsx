import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { EligibleOrdersTable } from "@/components/orders/eligible-orders-table";
import { OrdersTable } from "@/components/orders/orders-table";
import { buttonVariants } from "@/components/ui/button";
import {
	OrdersControllerFindAllParams,
	OrdersControllerFindEligibleForProgramsParams,
} from "@/lib/api/generated.schemas";
import {
	ordersControllerFindAll,
	ordersControllerFindEligibleForPrograms,
} from "@/lib/api/orders";
import { ordersBreadcrumbs } from "./breadcrumbs";

type OrdersPageQuery = OrdersControllerFindAllParams & {
	eligibleForProgram?: string;
};

interface PageProps {
	searchParams: Promise<OrdersPageQuery>;
}

export default async function Page({ searchParams }: PageProps) {
	const query = await searchParams;
	if (query.eligibleForProgram === "true") {
		const requestedPage = Number(query.page);
		const page =
			Number.isSafeInteger(requestedPage) && requestedPage > 0
				? requestedPage
				: 1;
		const search = typeof query.search === "string" ? query.search : undefined;
		const eligibleOrdersQuery: OrdersControllerFindEligibleForProgramsParams = {
			page,
			limit: 21,
			...(search && { search }),
		};
		const eligibleOrders =
			await ordersControllerFindEligibleForPrograms(eligibleOrdersQuery);

		return (
			<>
				<Breadcrumbs items={ordersBreadcrumbs.home()} />

				<PageHeader
					title="Eligible orders"
					description="Orders ready to be added to a forecast program."
				>
					<Link
						className={buttonVariants({ variant: "outline" })}
						href="/dashboard/orders"
					>
						All orders
					</Link>
				</PageHeader>

				<EligibleOrdersTable
					data={eligibleOrders.slice(0, 20)}
					search={search}
					page={page}
					hasNextPage={eligibleOrders.length > 20}
				/>
			</>
		);
	}

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
