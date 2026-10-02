"use client";

import { PanelLeftIcon, PanelTopIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";
import { useAppearance } from "@/providers/appearance-provider";

export function WorkspaceLayoutSwitch({ className }: { className?: string }) {
	const t = useTranslate();
	const { preferences, setWorkspaceLayout } = useAppearance();
	const toCenteredHeader = preferences.workspaceLayout === "sidebar";
	const label = t(
		toCenteredHeader
			? Messages.navigation.switchToCentered
			: Messages.navigation.switchToSidebar,
	);
	const Icon = toCenteredHeader ? PanelTopIcon : PanelLeftIcon;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger
					render={
						<Button
							variant="ghost"
							size="icon-xs"
							className={cn(
								"relative size-8 after:absolute after:-inset-1.5 after:content-['']",
								className,
							)}
							aria-label={label}
							onClick={() =>
								setWorkspaceLayout(
									toCenteredHeader ? "centered-header" : "sidebar",
								)
							}
						>
							<Icon aria-hidden="true" className="size-5" />
						</Button>
					}
				/>
				<TooltipContent>{label}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
