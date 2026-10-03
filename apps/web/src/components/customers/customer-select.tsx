"use client";

import { CustomerOptionsSelect } from "@/components/customers/customer-options-select";
import { useCustomersControllerFindAll } from "@/lib/api/customers";

interface CustomerSelectProps {
	id?: string;
	value?: number;
	onChange: (value: number) => void;
}

export function CustomerSelect({ id, value, onChange }: CustomerSelectProps) {
	const {
		data: customers = [],
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useCustomersControllerFindAll({});

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
