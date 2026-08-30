import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CustomerDetailsClient } from "@/components/customers/customer-details-client";
import { customersControllerFindOne } from "@/lib/api/customers";
import { customersBreadcrumbs } from "../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const customer = await customersControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs
				items={customersBreadcrumbs.detail(id, customer.companyName)}
			/>
			<CustomerDetailsClient customer={customer} />
		</>
	);
}
