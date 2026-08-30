import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { CustomersTable } from "@/components/customers/customers-table";
import { buttonVariants } from "@/components/ui/button";
import { customersControllerFindAll } from "@/lib/api/customers";
import type { CustomersControllerFindAllParams } from "@/lib/api/generated.schemas";
import { customersBreadcrumbs } from "./breadcrumbs";

interface PageProps {
	searchParams: Promise<CustomersControllerFindAllParams>;
}

export default async function Page({ searchParams }: PageProps) {
	const query = await searchParams;
	const customers = await customersControllerFindAll(query);

	return (
		<>
			<Breadcrumbs items={customersBreadcrumbs.home()} />

			<PageHeader
				title="Customers"
				description="Manage enterprise customer profiles and contacts."
			>
				<Link className={buttonVariants()} href="/dashboard/customers/new">
					<PlusIcon />
					Create Customer
				</Link>
			</PageHeader>

			<CustomersTable data={customers} />
		</>
	);
}
