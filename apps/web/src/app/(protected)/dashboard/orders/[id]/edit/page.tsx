import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UnderConstruction } from "@/components/under-construction";
import { ordersControllerFindOne } from "@/lib/api/orders";
import { ordersBreadcrumbs } from "../../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const order = await ordersControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs
				items={ordersBreadcrumbs.edit(id, order.orderNumber ?? `#${order.id}`)}
			/>

			<UnderConstruction />
		</>
	);
}
