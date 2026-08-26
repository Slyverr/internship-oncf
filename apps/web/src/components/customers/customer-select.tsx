"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCustomersControllerFindAll } from "@/lib/api/customers";

interface CustomerSelectProps {
	value?: number;
	onChange: (value: number) => void;
}

export function CustomerSelect({ value, onChange }: CustomerSelectProps) {
	const { data: customers = [], isLoading } = useCustomersControllerFindAll({});

	const selectedCustomer = customers.find((customer) => customer.id === value);

	return (
		<Select
			value={value?.toString()}
			onValueChange={(value) => onChange(Number(value))}
			disabled={isLoading}
		>
			<SelectTrigger className="w-full">
				<SelectValue>
					{selectedCustomer ? selectedCustomer.companyName : "Select customer"}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{customers.map((customer) => (
					<SelectItem key={customer.id} value={customer.id.toString()}>
						{customer.companyName}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
