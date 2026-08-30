"use client";

import { ClaimPriority } from "@ecommand/shared";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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
				<SelectValue placeholder="Select priority" />
			</SelectTrigger>

			<SelectContent>
				{Object.values(ClaimPriority).map((priority) => (
					<SelectItem key={priority} value={priority} className="capitalize">
						{priority}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
