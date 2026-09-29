"use client";

import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import { Checkbox } from "@/components/ui/checkbox";
import { useCustomersControllerFindAll } from "@/lib/api/customers";

interface CustomerPortfolioFieldProps {
	value: number[];
	onChange: (value: number[]) => void;
}

export function CustomerPortfolioField({
	value,
	onChange,
}: CustomerPortfolioFieldProps) {
	const {
		data: customers = [],
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useCustomersControllerFindAll({});

	return (
		<fieldset className="oncf-field @3xl/workspace:col-span-2">
			<legend className="text-sm font-medium">Customer portfolio</legend>
			<p className="text-meta text-muted-foreground">
				Choose which customers this agent can manage. An empty portfolio gives
				the agent no customer-scoped records.
			</p>
			{isLoading ? (
				<p className="text-sm text-muted-foreground">Loading customers…</p>
			) : isError ? (
				<InlineQueryRetry
					message="Could not load customers. Check your connection."
					retryLabel="Retry customers"
					isFetching={isFetching}
					onRetry={() => void refetch()}
				/>
			) : customers.length === 0 ? (
				<p role="status" className="text-sm text-muted-foreground">
					No customers are available.
				</p>
			) : (
				<div className="grid max-h-64 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
					{customers.map((customer) => {
						const checked = value.includes(customer.id);
						return (
							<label
								key={customer.id}
								htmlFor={`customer-${customer.id}`}
								className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-transparent px-3 transition-colors hover:bg-muted/60 has-aria-checked:border-border has-aria-checked:bg-muted/40"
							>
								<Checkbox
									id={`customer-${customer.id}`}
									checked={checked}
									onCheckedChange={(nextChecked) => {
										if (nextChecked === true) {
											onChange([...value, customer.id]);
										} else {
											onChange(value.filter((id) => id !== customer.id));
										}
									}}
								/>
								<span className="grid min-w-0 gap-compact">
									<span className="truncate text-sm font-medium">
										{customer.companyName}
									</span>
									<span className="truncate text-meta text-muted-foreground">
										{customer.customerCode}
									</span>
								</span>
							</label>
						);
					})}
				</div>
			)}
			<p className="text-meta text-muted-foreground" aria-live="polite">
				{value.length} {value.length === 1 ? "customer" : "customers"} selected
			</p>
		</fieldset>
	);
}
