"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

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
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							aria-label={label}
							onClick={onClick}
						>
							<Icon aria-hidden="true" />
						</Button>
					}
				/>
				<TooltipContent>{label}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
