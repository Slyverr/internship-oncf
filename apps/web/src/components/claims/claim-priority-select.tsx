"use client";

import { ClaimPriority } from "@ecommand/shared";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatEnumLabel } from "@/lib/enum-labels";

interface ClaimPrioritySelectProps {
	value?: ClaimPriority;
	onChange: (value: ClaimPriority) => void;
}

export function ClaimPrioritySelect({
	value,
	onChange,
}: ClaimPrioritySelectProps) {
	return (
		<Select
			value={value}
			onValueChange={(val) => onChange(val as ClaimPriority)}
		>
			<SelectTrigger className="w-full">
				<SelectValue>
					{value ? formatEnumLabel(value) : "Select priority"}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{Object.values(ClaimPriority).map((priority) => (
					<SelectItem key={priority} value={priority}>
						{formatEnumLabel(priority)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
