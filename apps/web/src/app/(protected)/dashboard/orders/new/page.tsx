import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OrderCreateForm } from "@/components/orders/order-create-form";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { ordersBreadcrumbs } from "../breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.orders.createForm.title),
	};
}

export default async function Page() {
	const t = await getRequestTranslator();
	return (
		<>
			<Breadcrumbs items={ordersBreadcrumbs.create(t)} />

			<OrderCreateForm />
		</>
	);
}
