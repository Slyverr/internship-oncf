"use client";

import { OrderStatus } from "@ecommand/shared";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatEnumLabel } from "@/lib/enum-labels";

interface OrderStatusSelectProps {
	value?: OrderStatus;
	onChange: (value: OrderStatus) => void;
}

export function OrderStatusSelect({ value, onChange }: OrderStatusSelectProps) {
	return (
		<Select
			value={value ?? null}
			onValueChange={(value) => onChange(value as OrderStatus)}
		>
			<SelectTrigger className="w-full">
				<SelectValue>
					{value ? formatEnumLabel(value) : "Select status"}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{Object.values(OrderStatus).map((status) => (
					<SelectItem key={status} value={status}>
						{formatEnumLabel(status)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
