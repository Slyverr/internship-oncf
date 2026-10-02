import type { Metadata } from "next";
import { AccessDeniedState } from "@/components/common/access-denied-state";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OrderDetailsClient } from "@/components/orders/order-details-client";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { ordersControllerFindOne } from "@/lib/api/orders";
import { loadPageData } from "@/lib/load-page-data";
import { ordersBreadcrumbs } from "../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const t = await getRequestTranslator();
	const { id } = await params;
	return { title: t(Messages.orders.detail.title, { recordCode: id }) };
}

export default async function Page({ params }: PageProps) {
	const t = await getRequestTranslator();
	const { id } = await params;
	const order = await loadPageData(ordersControllerFindOne(id));
	if (!order) {
		return (
			<AccessDeniedState
				title={t(Messages.orders.pageTitle)}
				description={t(Messages.apiError.accessDenied)}
				breadcrumbs={ordersBreadcrumbs.home(t)}
			/>
		);
	}

	return (
		<>
			<Breadcrumbs items={ordersBreadcrumbs.detail(id, order.orderNumber, t)} />

			<OrderDetailsClient order={order} />
		</>
	);
}
