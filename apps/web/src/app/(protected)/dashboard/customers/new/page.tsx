import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CustomerCreateForm } from "@/components/customers/customer-create-form";
import { customersBreadcrumbs } from "../breadcrumbs";

export default function Page() {
	return (
		<>
			<Breadcrumbs items={customersBreadcrumbs.create()} />
			<CustomerCreateForm />
		</>
	);
}
