import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UnderConstruction } from "@/components/under-construction";
import { ordersControllerFindOne } from "@/lib/api/orders";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const order = await ordersControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs
				items={[
					{ label: "Orders", href: "/dashboard/orders" },
					{
						label: order.orderNumber,
						href: `/dashboard/orders/${order.id}`,
					},
					{ label: "Edit" },
				]}
			/>

			<UnderConstruction />
		</>
	);
}
