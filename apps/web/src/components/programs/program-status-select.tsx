"use client";

import { ProgramStatus } from "@ecommand/shared";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { getProgramStatusLabel } from "@/i18n/status-labels";

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
	const locale = useLocale();
	const t = useTranslate();
	const statuses = Object.values(ProgramStatus);

	const selected = statuses.find((status) => status === value);

	return (
		<Select value={value} onValueChange={(value) => value && onChange(value)}>
			<SelectTrigger id={id} className="w-full">
				<SelectValue>
					{selected
						? getProgramStatusLabel(selected, locale)
						: t(Messages.programs.selectStatus)}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{statuses.map((status) => (
					<SelectItem key={status} value={status}>
						{getProgramStatusLabel(status, locale)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
