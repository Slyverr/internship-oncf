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
import type { OrderDetailDto } from "@/lib/api/generated.schemas";

type Order = Pick<OrderDetailDto, "id" | "orderNumber">;

interface OrderSelectProps {
	orders: Order[];
	isLoading?: boolean;
	isError?: boolean;
	isFetching?: boolean;
	emptyMessage?: string;
	onRetry?: () => void;
	id: string;

	value?: Order["id"];
	onChange: (value: Order["id"]) => void;
}

export function OrderSelect({
	orders,
	id,
	value,
	onChange,
	isLoading,
	isError,
	isFetching = false,
	emptyMessage,
	onRetry,
}: OrderSelectProps) {
	const t = useTranslate();
	const resolvedEmptyMessage = emptyMessage ?? t(Messages.orders.select.empty);
	const selected = orders.find((order) => order.id === value);

	return (
		<>
			<Combobox
				items={orders}
				disabled={isLoading || (isError && orders.length === 0)}
				value={selected ?? null}
				onValueChange={(order) => order && onChange(order.id)}
				itemToStringLabel={(order) => order.orderNumber}
				itemToStringValue={(order) => String(order.id)}
			>
				<ComboboxInput
					id={id}
					placeholder={t(Messages.orders.select.placeholder)}
				/>

				<ComboboxContent>
					<ComboboxEmpty>{resolvedEmptyMessage}</ComboboxEmpty>

					<ComboboxList>
						{(order) => (
							<ComboboxItem key={order.id} value={order}>
								{order.orderNumber}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			{isError && onRetry && (
				<InlineQueryRetry
					message={t(Messages.orders.select.loadFailed)}
					retryLabel={t(Messages.orders.select.retry)}
					isFetching={isFetching}
					onRetry={onRetry}
				/>
			)}
		</>
	);
}
