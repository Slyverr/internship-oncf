import { formatDistanceToNow, type Locale } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { type AppLocale, DEFAULT_LOCALE } from "@/i18n";

export { type AppLocale, DEFAULT_LOCALE } from "@/i18n";

const dateFnsLocales: Record<AppLocale, Locale> = { en: enUS };

function formatDateValue(
	value: string | Date,
	locale: AppLocale,
	options: Intl.DateTimeFormatOptions,
): string {
	const isDateOnly =
		typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
	return new Intl.DateTimeFormat(locale, {
		...options,
		...(isDateOnly ? { timeZone: "UTC" } : {}),
	}).format(new Date(value));
}

export function formatDisplayDate(
	value?: string | null,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	return value ? formatDateValue(value, locale, {}) : "—";
}

export function formatMediumDate(
	value?: string | null,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	return value ? formatDateValue(value, locale, { dateStyle: "medium" }) : "—";
}

export function formatMonthDay(
	value: string | Date,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	return formatDateValue(value, locale, {
		month: "short",
		day: "numeric",
	});
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

export function formatMonthYear(
	value: string,
	locale: AppLocale = DEFAULT_LOCALE,
): string {
	if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return "—";
	return new Intl.DateTimeFormat(locale, {
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${value}-01T00:00:00.000Z`));
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
		locale: dateFnsLocales[locale],
	});
}
