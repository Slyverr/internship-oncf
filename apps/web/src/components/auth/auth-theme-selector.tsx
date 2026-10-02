"use client";

import { PaletteIcon } from "lucide-react";
import { ThemePreview } from "@/components/common/theme-preview";
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
import { Messages, translate } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { type ThemeMode, useAppearance } from "@/providers/appearance-provider";

const themes: { value: ThemeMode; label: Parameters<typeof translate>[0] }[] = [
	{
		value: "system",
		label: Messages.settings.appearance.options.theme.system.label,
	},
	{
		value: "light",
		label: Messages.settings.appearance.options.theme.light.label,
	},
	{
		value: "dark",
		label: Messages.settings.appearance.options.theme.dark.label,
	},
	{
		value: "mono-light",
		label: Messages.settings.appearance.options.theme.monoLight.label,
	},
	{
		value: "mono-dark",
		label: Messages.settings.appearance.options.theme.monoDark.label,
	},
];

export function AuthThemeSelector() {
	const t = useTranslate();
	const { setTheme, theme } = useAppearance();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						type="button"
						className={buttonVariants({ variant: "outline", size: "icon" })}
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
								<ThemePreview theme={option.value} size="compact" />
								{t(option.label)}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
