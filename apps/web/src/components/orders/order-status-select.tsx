"use client";

import { OrderStatus } from "@ecommand/shared";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { getOrderStatusLabel } from "@/i18n/status-labels";

interface OrderStatusSelectProps {
	value?: OrderStatus;
	onChange: (value: OrderStatus) => void;
}

export function OrderStatusSelect({ value, onChange }: OrderStatusSelectProps) {
	const locale = useLocale();
	const t = useTranslate();
	return (
		<Select
			value={value ?? null}
			onValueChange={(value) => onChange(value as OrderStatus)}
		>
			<SelectTrigger className="w-full">
				<SelectValue>
					{value
						? getOrderStatusLabel(value, locale)
						: t(Messages.orders.selectStatus)}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{Object.values(OrderStatus).map((status) => (
					<SelectItem key={status} value={status}>
						{getOrderStatusLabel(status, locale)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
