"use client";

import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

	const selectedCustomer = customers.find((customer) => customer.id === value);

	return (
		<div className="space-y-2">
			<Select
				value={value?.toString() ?? null}
				onValueChange={(value) => onChange(Number(value))}
				disabled={isLoading || customers.length === 0}
			>
				<SelectTrigger id={id} className="w-full">
					<SelectValue>
						{selectedCustomer?.companyName ??
							(isLoading
								? "Loading customers…"
								: customers.length === 0
									? "No customers available"
									: "Select customer")}
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
			{isError && (
				<InlineQueryRetry
					message="Could not load customers. Check your connection."
					retryLabel="Retry customers"
					isFetching={isFetching}
					onRetry={() => void refetch()}
				/>
			)}
			{!isLoading && !isError && customers.length === 0 && (
				<p role="status" className="text-sm text-muted-foreground">
					No customers are available.
				</p>
			)}
		</div>
	);
}
