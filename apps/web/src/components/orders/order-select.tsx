"use client";

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

	value?: Order["id"];
	onChange: (value: Order["id"]) => void;
}

export function OrderSelect({
	orders,
	value,
	onChange,
	isLoading,
}: OrderSelectProps) {
	const selected = orders.find((order) => order.id === value);

	return (
		<Combobox
			items={orders}
			disabled={isLoading}
			value={selected ?? null}
			onValueChange={(order) => order && onChange(order.id)}
			itemToStringLabel={(order) => order.orderNumber ?? `Order #${order.id}`}
			itemToStringValue={(order) => String(order.id)}
		>
			<ComboboxInput placeholder="Select order" aria-label="Select order" />

			<ComboboxContent>
				<ComboboxEmpty>No orders found.</ComboboxEmpty>

				<ComboboxList>
					{(order) => (
						<ComboboxItem key={order.id} value={order}>
							{order.orderNumber ?? `Order #${order.id}`}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
