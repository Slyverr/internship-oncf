import { ThemePreview } from "@/components/common/theme-preview";
import { type MessageKey, Messages } from "@/i18n";
import type { ThemeMode } from "@/providers/appearance-provider";

export function getThemeOptions() {
	const options: {
		value: ThemeMode;
		label: MessageKey;
		description: MessageKey;
	}[] = [
		{
			value: "system",
			label: Messages.settings.appearance.options.theme.system.label,
			description:
				Messages.settings.appearance.options.theme.system.description,
		},
		{
			value: "light",
			label: Messages.settings.appearance.options.theme.light.label,
			description: Messages.settings.appearance.options.theme.light.description,
		},
		{
			value: "dark",
			label: Messages.settings.appearance.options.theme.dark.label,
			description: Messages.settings.appearance.options.theme.dark.description,
		},
		{
			value: "mono-light",
			label: Messages.settings.appearance.options.theme.monoLight.label,
			description:
				Messages.settings.appearance.options.theme.monoLight.description,
		},
		{
			value: "mono-dark",
			label: Messages.settings.appearance.options.theme.monoDark.label,
			description:
				Messages.settings.appearance.options.theme.monoDark.description,
		},
	];

	return options.map((option) => ({
		...option,
		preview: <ThemePreview theme={option.value} size="compact" />,
	}));
}
