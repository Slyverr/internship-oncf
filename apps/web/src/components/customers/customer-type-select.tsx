"use client";

import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { useCatalogControllerFindCustomerTypes } from "@/lib/api/catalog";
import type { CustomerTypeDto } from "@/lib/api/generated.schemas";
import { getCustomerTypeLabel } from "@/lib/customer-type-label";

type CustomerTypeOption = Pick<CustomerTypeDto, "id" | "name">;

interface CustomerTypeSelectProps {
	id: string;
	value?: string;
	disabled?: boolean;
	placeholder?: string;
	onChange: (value: string) => void;
}

export function CustomerTypeSelect({
	id,
	value,
	disabled,
	placeholder,
	onChange,
}: CustomerTypeSelectProps) {
	const t = useTranslate();
	const {
		data: types = [],
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useCatalogControllerFindCustomerTypes();
	const options: CustomerTypeOption[] = [
		{ id: "", name: t(Messages.customers.form.typeSelect.none) },
		...types.map(({ id: typeId, name }) => ({
			id: typeId,
			name: getCustomerTypeLabel(name, t) ?? name,
		})),
	];
	const selected = value
		? (options.find((type) => type.id === value) ?? null)
		: null;

	return (
		<div className="oncf-field">
			<Combobox
				items={options}
				disabled={disabled || isLoading || isError}
				value={selected}
				onValueChange={(type) => type && onChange(type.id)}
				itemToStringLabel={(type) => type.name}
				itemToStringValue={(type) => type.id}
			>
				<ComboboxInput
					id={id}
					placeholder={
						isLoading
							? t(Messages.customers.form.typeSelect.loading)
							: isError
								? t(Messages.customers.form.typeSelect.unavailable)
								: (placeholder ??
									t(Messages.customers.form.typeSelect.placeholder))
					}
				/>
				<ComboboxContent>
					<ComboboxEmpty>
						{t(Messages.customers.form.typeSelect.empty)}
					</ComboboxEmpty>
					<ComboboxList>
						{(type) => (
							<ComboboxItem key={type.id || "none"} value={type}>
								{type.name}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			{isError && (
				<InlineQueryRetry
					message={t(Messages.customers.form.typeSelect.loadFailed)}
					retryLabel={t(Messages.customers.form.typeSelect.retry)}
					isFetching={isFetching}
					onRetry={() => void refetch()}
				/>
			)}
			{!isLoading && !isError && types.length === 0 && (
				<p role="status" className="text-sm text-muted-foreground">
					{t(Messages.customers.form.typeSelect.noneAvailable)}
				</p>
			)}
		</div>
	);
}
