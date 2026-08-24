"use client";

import { Unit } from "@ecommand/shared";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface UnitSelectProps {
	value?: number;
	onChange: (value: number) => void;
}

export function UnitSelect({ value, onChange }: UnitSelectProps) {
	const units = Object.values(Unit).map((name, index) => ({
		id: index + 1,
		name,
	}));

	const selectedUnit = units.find((unit) => unit.id === value);

	return (
		<Select
			value={value?.toString()}
			onValueChange={(value) => onChange(Number(value))}
		>
			<SelectTrigger className="w-full">
				<SelectValue>
					{selectedUnit ? selectedUnit.name : "Select unit"}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{units.map((unit) => (
					<SelectItem key={unit.id} value={unit.id.toString()}>
						{unit.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
