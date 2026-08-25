"use client";

import { ProgramStatus } from "@ecommand/shared";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ProgramStatusSelectProps {
	value?: ProgramStatus;
	onChange: (value: ProgramStatus) => void;
}

export function ProgramStatusSelect({
	value,
	onChange,
}: ProgramStatusSelectProps) {
	const statuses = Object.values(ProgramStatus);

	const selected = statuses.find((status) => status === value);

	return (
		<Select value={value} onValueChange={(value) => value && onChange(value)}>
			<SelectTrigger className="w-full">
				<SelectValue>{selected ? selected : "Select status"}</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{statuses.map((status) => (
					<SelectItem key={status} value={status}>
						{status}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
