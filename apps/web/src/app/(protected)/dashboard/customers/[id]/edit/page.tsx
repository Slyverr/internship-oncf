import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CustomerEditForm } from "@/components/customers/customer-edit-form";
import { customersControllerFindOne } from "@/lib/api/customers";
import { customersBreadcrumbs } from "../../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const customer = await customersControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs
				items={customersBreadcrumbs.edit(id, customer.companyName)}
			/>
			<CustomerEditForm customer={customer} />
		</>
	);
}
