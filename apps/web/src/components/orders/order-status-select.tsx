"use client";

import { OrderStatus } from "@ecommand/shared";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface OrderStatusSelectProps {
	value?: OrderStatus;
	onChange: (value: OrderStatus) => void;
}

export function OrderStatusSelect({ value, onChange }: OrderStatusSelectProps) {
	return (
		<Select
			value={value}
			onValueChange={(value) => onChange(value as OrderStatus)}
		>
			<SelectTrigger className="w-full">
				<SelectValue placeholder="Select status" />
			</SelectTrigger>

			<SelectContent>
				{Object.values(OrderStatus).map((status) => (
					<SelectItem key={status} value={status}>
						{status}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
