"use client";

import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { useCustomersControllerFindAll } from "@/lib/api/customers";

interface CustomerSelectProps {
	id?: string;
	value?: number;
	onChange: (value: number) => void;
}

export function CustomerSelect({ id, value, onChange }: CustomerSelectProps) {
	const t = useTranslate();
	const {
		data: customers = [],
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useCustomersControllerFindAll({});

	const selectedCustomer = customers.find((customer) => customer.id === value);

	return (
		<div className="oncf-field">
			<Select
				value={value?.toString() ?? null}
				onValueChange={(value) => onChange(Number(value))}
				disabled={isLoading || customers.length === 0}
			>
				<SelectTrigger id={id} className="w-full">
					<SelectValue>
						{selectedCustomer?.companyName ??
							(isLoading
								? t(Messages.customers.select.loading)
								: customers.length === 0
									? t(Messages.customers.select.none)
									: t(Messages.customers.select.placeholder))}
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
					message={t(Messages.customers.select.loadFailed)}
					retryLabel={t(Messages.customers.select.retry)}
					isFetching={isFetching}
					onRetry={() => void refetch()}
				/>
			)}
			{!isLoading && !isError && customers.length === 0 && (
				<p role="status" className="text-sm text-muted-foreground">
					{t(Messages.customers.select.unavailable)}
				</p>
			)}
		</div>
	);
}
