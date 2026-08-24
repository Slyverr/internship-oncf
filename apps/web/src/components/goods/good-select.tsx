"use client";

import { GoodsType } from "@ecommand/shared";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface GoodSelectProps {
	value?: number;
	onChange: (value: number) => void;
}

export function GoodSelect({ value, onChange }: GoodSelectProps) {
	const goods = Object.values(GoodsType).map((name, index) => ({
		id: index + 1,
		name,
	}));

	const selectedGood = goods.find((good) => good.id === value);

	return (
		<Select
			value={value?.toString()}
			onValueChange={(value) => onChange(Number(value))}
		>
			<SelectTrigger className="w-full">
				<SelectValue>
					{selectedGood ? selectedGood.name : "Select good"}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{goods.map((good) => (
					<SelectItem key={good.id} value={good.id.toString()}>
						{good.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
