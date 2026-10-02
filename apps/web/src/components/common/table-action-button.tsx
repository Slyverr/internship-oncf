"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type TableActionButtonProps = {
	icon: LucideIcon;
	label: string;
	onClick: () => void;
};

export function TableActionButton({
	icon: Icon,
	label,
	onClick,
}: TableActionButtonProps) {
	return (
		<Button type="button" variant="ghost" onClick={onClick}>
			<Icon aria-hidden="true" data-icon="inline-start" />
			{label}
		</Button>
	);
}
