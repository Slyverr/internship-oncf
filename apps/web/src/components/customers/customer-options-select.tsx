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

interface CustomerOption {
	id: number;
	companyName: string;
}

interface CustomerOptionsSelectProps {
	id?: string;
	value?: number;
	customers: readonly CustomerOption[];
	isLoading: boolean;
	isError: boolean;
	isFetching: boolean;
	onChange: (value: number) => void;
	onRetry: () => void;
}

export function CustomerOptionsSelect({
	id,
	value,
	customers,
	isLoading,
	isError,
	isFetching,
	onChange,
	onRetry,
}: CustomerOptionsSelectProps) {
	const t = useTranslate();
	const selectedCustomer = customers.find((customer) => customer.id === value);

	return (
		<>
			<Select
				value={value?.toString() ?? null}
				onValueChange={(nextValue) => onChange(Number(nextValue))}
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
					onRetry={onRetry}
				/>
			)}
			{!isLoading && !isError && customers.length === 0 && (
				<p role="status" className="text-sm text-muted-foreground">
					{t(Messages.customers.select.unavailable)}
				</p>
			)}
		</>
	);
}
