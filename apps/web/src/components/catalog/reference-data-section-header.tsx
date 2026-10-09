"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";

export function ReferenceDataSectionHeader({
	title,
	onAdd,
	addDisabled = false,
}: {
	title: string;
	onAdd: () => void;
	addDisabled?: boolean;
}) {
	const t = useTranslate();

	return (
		<div className="mb-4 flex flex-wrap items-center justify-between gap-4">
			<h2 className="text-base font-semibold">{title}</h2>
			<Button type="button" onClick={onAdd} disabled={addDisabled}>
				<PlusIcon aria-hidden="true" />
				{t(Messages.referenceData.add)}
			</Button>
		</div>
	);
}
