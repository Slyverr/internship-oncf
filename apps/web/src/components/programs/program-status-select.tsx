"use client";

import { ProgramStatus } from "@ecommand/shared";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatEnumLabel } from "@/lib/enum-labels";

interface ProgramStatusSelectProps {
	id?: string;
	value?: ProgramStatus;
	onChange: (value: ProgramStatus) => void;
}

export function ProgramStatusSelect({
	id,
	value,
	onChange,
}: ProgramStatusSelectProps) {
	const statuses = Object.values(ProgramStatus);

	const selected = statuses.find((status) => status === value);

	return (
		<Select value={value} onValueChange={(value) => value && onChange(value)}>
			<SelectTrigger id={id} className="w-full">
				<SelectValue>
					{selected ? formatEnumLabel(selected) : "Select status"}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{statuses.map((status) => (
					<SelectItem key={status} value={status}>
						{formatEnumLabel(status)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
