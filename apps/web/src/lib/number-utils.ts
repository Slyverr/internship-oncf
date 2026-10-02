import { type AppLocale, DEFAULT_LOCALE } from "@/i18n";

export function formatNumber(
	value: number,
	locale: AppLocale = DEFAULT_LOCALE,
	options: Intl.NumberFormatOptions = {},
): string {
	return new Intl.NumberFormat(locale, options).format(value);
}
