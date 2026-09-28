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
import type { OrderDetailDto } from "@/lib/api/generated.schemas";

type Order = Pick<OrderDetailDto, "id" | "orderNumber">;

interface OrderSelectProps {
	orders: Order[];
	isLoading?: boolean;
	isError?: boolean;
	isFetching?: boolean;
	emptyMessage?: string;
	onRetry?: () => void;
	id?: string;

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
	emptyMessage = "No orders found.",
	onRetry,
}: OrderSelectProps) {
	const selected = orders.find((order) => order.id === value);

	return (
		<div className="oncf-field">
			<Combobox
				items={orders}
				disabled={isLoading || (isError && orders.length === 0)}
				value={selected ?? null}
				onValueChange={(order) => order && onChange(order.id)}
				itemToStringLabel={(order) => order.orderNumber ?? `Order #${order.id}`}
				itemToStringValue={(order) => String(order.id)}
			>
				<ComboboxInput
					id={id}
					placeholder="Select order"
					aria-label="Select order"
				/>

				<ComboboxContent>
					<ComboboxEmpty>{emptyMessage}</ComboboxEmpty>

					<ComboboxList>
						{(order) => (
							<ComboboxItem key={order.id} value={order}>
								{order.orderNumber ?? `Order #${order.id}`}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
			{isError && onRetry && (
				<InlineQueryRetry
					message="Could not load orders. Check your connection."
					retryLabel="Retry orders"
					isFetching={isFetching}
					onRetry={onRetry}
				/>
			)}
		</div>
	);
}
