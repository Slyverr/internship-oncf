"use client";

import { ClaimStatus } from "@ecommand/shared";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Messages } from "@/i18n";
import { getClaimStatusLabel } from "@/i18n/claim-labels";
import { useLocale, useTranslate } from "@/i18n/locale-provider";

interface ClaimStatusSelectProps {
	value?: ClaimStatus;
	onChange: (value: ClaimStatus) => void;
}

export function ClaimStatusSelect({ value, onChange }: ClaimStatusSelectProps) {
	const locale = useLocale();
	const t = useTranslate();
	return (
		<Select value={value} onValueChange={(val) => onChange(val as ClaimStatus)}>
			<SelectTrigger className="w-full">
				<SelectValue>
					{value
						? getClaimStatusLabel(value, locale)
						: t(Messages.claims.selectStatus)}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{Object.values(ClaimStatus).map((status) => (
					<SelectItem key={status} value={status}>
						{getClaimStatusLabel(status, locale)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
