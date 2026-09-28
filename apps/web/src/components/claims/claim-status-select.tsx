"use client";

import { ClaimStatus } from "@ecommand/shared";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatEnumLabel } from "@/lib/enum-labels";

interface ClaimStatusSelectProps {
	value?: ClaimStatus;
	onChange: (value: ClaimStatus) => void;
}

export function ClaimStatusSelect({ value, onChange }: ClaimStatusSelectProps) {
	return (
		<Select value={value} onValueChange={(val) => onChange(val as ClaimStatus)}>
			<SelectTrigger className="w-full">
				<SelectValue>
					{value ? formatEnumLabel(value) : "Select status"}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{Object.values(ClaimStatus).map((status) => (
					<SelectItem key={status} value={status}>
						{formatEnumLabel(status)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
