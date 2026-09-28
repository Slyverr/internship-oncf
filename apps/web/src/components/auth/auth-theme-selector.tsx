"use client";

import { PaletteIcon } from "lucide-react";
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
import { type ThemeMode, useAppearance } from "@/providers/appearance-provider";

const themes: { value: ThemeMode; label: string }[] = [
	{ value: "system", label: "System" },
	{ value: "light", label: "Warm light" },
	{ value: "dark", label: "Charcoal dark" },
	{ value: "mono-light", label: "Monochrome light" },
	{ value: "mono-dark", label: "Monochrome dark" },
];

export function AuthThemeSelector() {
	const { initialized, setTheme, theme } = useAppearance();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						type="button"
						className={buttonVariants({ variant: "outline", size: "icon" })}
						aria-label="Choose appearance theme"
						disabled={!initialized}
					/>
				}
			>
				<PaletteIcon aria-hidden="true" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuGroup>
					<DropdownMenuLabel>Theme</DropdownMenuLabel>
					<DropdownMenuRadioGroup
						value={theme}
						onValueChange={(value) => setTheme(value as ThemeMode)}
					>
						{themes.map((option) => (
							<DropdownMenuRadioItem key={option.value} value={option.value}>
								{option.label}
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
