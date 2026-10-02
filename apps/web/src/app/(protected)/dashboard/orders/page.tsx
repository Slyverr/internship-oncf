import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AccessDeniedState } from "@/components/common/access-denied-state";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { EligibleOrdersTable } from "@/components/orders/eligible-orders-table";
import { OrdersTable } from "@/components/orders/orders-table";
import { buttonVariants } from "@/components/ui/button";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import {
	OrdersControllerFindAllParams,
	OrdersControllerFindEligibleForProgramsParams,
} from "@/lib/api/generated.schemas";
import {
	ordersControllerFindAll,
	ordersControllerFindEligibleForPrograms,
} from "@/lib/api/orders";
import { loadPageData } from "@/lib/load-page-data";
import { ordersBreadcrumbs } from "./breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.orders.pageTitle),
	};
}

type OrdersPageQuery = OrdersControllerFindAllParams & {
	eligibleForProgram?: string;
};

interface PageProps {
	searchParams: Promise<OrdersPageQuery>;
}

export default async function Page({ searchParams }: PageProps) {
	const t = await getRequestTranslator();
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
		const eligibleOrders = await loadPageData(
			ordersControllerFindEligibleForPrograms(eligibleOrdersQuery),
		);

		if (!eligibleOrders)
			return (
				<AccessDeniedState
					title={t(Messages.orders.pageTitle)}
					description={t(Messages.apiError.accessDenied)}
					breadcrumbs={ordersBreadcrumbs.home(t)}
				/>
			);

		return (
			<>
				<Breadcrumbs items={ordersBreadcrumbs.home(t)} />

				<PageHeader
					title={t(Messages.orders.eligible.title)}
					description={t(Messages.orders.eligible.description)}
				>
					<Link
						className={buttonVariants({ variant: "outline" })}
						href="/dashboard/orders"
					>
						{t(Messages.orders.all)}
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

	const orders = await loadPageData(ordersControllerFindAll(query));

	if (!orders)
		return (
			<AccessDeniedState
				title={t(Messages.orders.pageTitle)}
				description={t(Messages.apiError.accessDenied)}
				breadcrumbs={ordersBreadcrumbs.home(t)}
			/>
		);

	return (
		<>
			<Breadcrumbs items={ordersBreadcrumbs.home(t)} />

			<PageHeader
				title={t(Messages.orders.pageTitle)}
				description={t(Messages.orders.pageDescription)}
			>
				<Link className={buttonVariants()} href="/dashboard/orders/new">
					<PlusIcon />
					{t(Messages.orders.create)}
				</Link>
			</PageHeader>

			<OrdersTable data={orders} />
		</>
	);
}
