import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

export const DEFAULT_LOCALE = "en" as const;

export type AppLocale = typeof DEFAULT_LOCALE;

export function formatDisplayDate(
	value?: string | null,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	return value ? new Date(value).toLocaleDateString(locale) : "—";
}

export function formatMediumDate(
	value?: string | null,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	return value
		? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
				new Date(value),
			)
		: "—";
}

export function formatDisplayDateTime(
	value?: string | null,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	return value ? new Date(value).toLocaleString(locale) : "—";
}

export function formatMessageTime(
	value: string | Date,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	return new Intl.DateTimeFormat(locale, {
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(value));
}

export function formatFullMessageTime(
	value: string | Date,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	return new Intl.DateTimeFormat(locale, {
		dateStyle: "full",
		timeStyle: "short",
	}).format(new Date(value));
}

export function formatMonthLabel(
	value: string | Date,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	return new Intl.DateTimeFormat(locale, {
		month: "short",
		timeZone: "UTC",
	}).format(new Date(value));
}

export function toDateInputValue(value?: string | null): string {
	return value?.slice(0, 10) ?? "";
}

export function formatRelativeTime(
	value: string | Date,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	const date = typeof value === "string" ? new Date(value) : value;
	return formatDistanceToNow(date, {
		addSuffix: true,
		locale: locale === "en" ? enUS : undefined,
	});
}
