"use client";

import { ClaimPriority } from "@ecommand/shared";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Messages } from "@/i18n";
import { getClaimPriorityLabel } from "@/i18n/claim-labels";
import { useLocale, useTranslate } from "@/i18n/locale-provider";

interface ClaimPrioritySelectProps {
	value?: ClaimPriority;
	onChange: (value: ClaimPriority) => void;
}

export function ClaimPrioritySelect({
	value,
	onChange,
}: ClaimPrioritySelectProps) {
	const locale = useLocale();
	const t = useTranslate();
	return (
		<Select
			value={value}
			onValueChange={(val) => onChange(val as ClaimPriority)}
		>
			<SelectTrigger className="w-full">
				<SelectValue>
					{value
						? getClaimPriorityLabel(value, locale)
						: t(Messages.claims.selectPriority)}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{Object.values(ClaimPriority).map((priority) => (
					<SelectItem key={priority} value={priority}>
						{getClaimPriorityLabel(priority, locale)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
