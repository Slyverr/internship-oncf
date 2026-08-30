"use client";

import { ClaimStatus } from "@ecommand/shared";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ClaimStatusSelectProps {
	value?: ClaimStatus;
	onChange: (value: ClaimStatus) => void;
}

export function ClaimStatusSelect({ value, onChange }: ClaimStatusSelectProps) {
	return (
		<Select value={value} onValueChange={(val) => onChange(val as ClaimStatus)}>
			<SelectTrigger className="w-full">
				<SelectValue placeholder="Select status" />
			</SelectTrigger>

			<SelectContent>
				{Object.values(ClaimStatus).map((status) => (
					<SelectItem key={status} value={status}>
						{status}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
