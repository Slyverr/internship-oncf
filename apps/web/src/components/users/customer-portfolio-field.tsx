"use client";

import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from "@/components/ui/combobox";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { useCustomersControllerFindPortfolioOptions } from "@/lib/api/customers";

interface CustomerPortfolioFieldProps {
	value: number[];
	onChange: (value: number[]) => void;
}

export function CustomerPortfolioField({
	value,
	onChange,
}: CustomerPortfolioFieldProps) {
	const t = useTranslate();
	const anchor = useComboboxAnchor();
	const {
		data: customers = [],
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useCustomersControllerFindPortfolioOptions();
	const selectedCustomers = customers.filter((customer) =>
		value.includes(customer.id),
	);

	return (
		<fieldset className="oncf-field min-w-0">
			<legend className="text-sm font-medium">
				{t(Messages.users.portfolio.title)}
			</legend>
			{isLoading ? (
				<p className="text-sm text-muted-foreground">
					{t(Messages.users.portfolio.loading)}
				</p>
			) : isError ? (
				<InlineQueryRetry
					message={t(Messages.users.portfolio.loadFailed)}
					retryLabel={t(Messages.users.portfolio.retry)}
					isFetching={isFetching}
					onRetry={() => void refetch()}
				/>
			) : customers.length === 0 ? (
				<p role="status" className="text-sm text-muted-foreground">
					{t(Messages.users.portfolio.empty)}
				</p>
			) : (
				<>
					<Combobox
						items={customers}
						multiple
						value={selectedCustomers}
						onValueChange={(selection) =>
							onChange(selection.map((customer) => customer.id))
						}
						itemToStringLabel={(customer) =>
							`${customer.companyName} ${customer.customerCode}`
						}
						itemToStringValue={(customer) => String(customer.id)}
					>
						<ComboboxValue>
							{(selected: typeof customers) => (
								<ComboboxChips
									ref={anchor}
									aria-label={t(Messages.users.portfolio.title)}
								>
									{selected.map((customer) => (
										<ComboboxChip
											key={customer.id}
											removeLabel={t(Messages.users.portfolio.removeCustomer, {
												name: customer.companyName,
											})}
										>
											<span className="max-w-40 truncate">
												{customer.companyName}
											</span>
										</ComboboxChip>
									))}
									<ComboboxChipsInput
										aria-label={t(Messages.customers.list.search)}
										placeholder={
											selected.length === 0
												? t(Messages.customers.list.search)
												: undefined
										}
									/>
								</ComboboxChips>
							)}
						</ComboboxValue>
						<ComboboxContent anchor={anchor}>
							<ComboboxEmpty>
								{t(Messages.customers.list.noResults)}
							</ComboboxEmpty>
							<ComboboxList className="max-h-32">
								{(customer) => (
									<ComboboxItem key={customer.id} value={customer}>
										<span className="min-w-0 flex-1 truncate">
											{customer.companyName}
										</span>
										<span className="text-meta text-muted-foreground">
											{customer.customerCode}
										</span>
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
					<p className="text-meta text-muted-foreground">
						{t(Messages.users.portfolio.description)}
					</p>
				</>
			)}
			<p className="sr-only" aria-live="polite">
				{t(Messages.users.portfolio.selectedCount, {
					count: value.length,
				})}
			</p>
		</fieldset>
	);
}
