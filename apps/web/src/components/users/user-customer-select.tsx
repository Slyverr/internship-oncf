"use client";

import { CustomerOptionsSelect } from "@/components/customers/customer-options-select";
import { useCustomersControllerFindPortfolioOptions } from "@/lib/api/customers";

interface UserCustomerSelectProps {
	id?: string;
	value?: number;
	onChange: (value: number) => void;
}

export function UserCustomerSelect({
	id,
	value,
	onChange,
}: UserCustomerSelectProps) {
	const {
		data: customers = [],
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useCustomersControllerFindPortfolioOptions();

	return (
		<CustomerOptionsSelect
			id={id}
			value={value}
			customers={customers}
			isLoading={isLoading}
			isError={isError}
			isFetching={isFetching}
			onChange={onChange}
			onRetry={() => void refetch()}
		/>
	);
}
