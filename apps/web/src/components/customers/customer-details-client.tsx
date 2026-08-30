"use client";

import { PageHeader } from "@/components/common/page-header";
import { CustomerActions } from "@/components/customers/customer-actions";
import { CustomerOverview } from "@/components/customers/customer-overview";
import { useCustomersControllerFindOne } from "@/lib/api/customers";
import type { CustomerDetailDto } from "@/lib/api/generated.schemas";

interface CustomerDetailsClientProps {
	customer: CustomerDetailDto;
}

export function CustomerDetailsClient({
	customer,
}: CustomerDetailsClientProps) {
	const { data: currentCustomer } = useCustomersControllerFindOne(customer.id, {
		query: {
			initialData: customer,
		},
	});

	if (!currentCustomer) return null;

	return (
		<>
			<PageHeader
				title={currentCustomer.companyName}
				description={
					currentCustomer.customerCode
						? `Code: ${currentCustomer.customerCode}`
						: undefined
				}
			>
				<CustomerActions customer={currentCustomer} />
			</PageHeader>

			<CustomerOverview customer={currentCustomer} />
		</>
	);
}
