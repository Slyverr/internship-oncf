"use client";

import { PaletteIcon } from "lucide-react";
import { getThemeOptions } from "@/components/common/theme-options";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { type ThemeMode, useAppearance } from "@/providers/appearance-provider";

export function AuthThemeSelector() {
	const t = useTranslate();
	const { setTheme, theme } = useAppearance();
	const themes = getThemeOptions();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						type="button"
						className={buttonVariants({
							variant: "ghost",
							size: "icon",
							className: "text-muted-foreground hover:text-primary",
						})}
						aria-label={t(Messages.auth.theme.choose)}
					/>
				}
			>
				<PaletteIcon aria-hidden="true" />
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-60 max-w-[calc(100vw-2rem)]"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel>{t(Messages.auth.theme.label)}</DropdownMenuLabel>
					<DropdownMenuRadioGroup
						value={theme}
						onValueChange={(value) => setTheme(value as ThemeMode)}
					>
						{themes.map((option) => (
							<DropdownMenuRadioItem key={option.value} value={option.value}>
								{option.preview}
								{t(option.label)}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
