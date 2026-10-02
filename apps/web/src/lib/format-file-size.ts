import { type AppLocale, DEFAULT_LOCALE } from "@/i18n";
import { formatNumber } from "@/lib/number-utils";

export function formatFileSize(
	bytes: number,
	locale: AppLocale = DEFAULT_LOCALE,
) {
	if (bytes < 1024) {
		return `${formatNumber(bytes, locale)} B`;
	}

	if (bytes < 1024 * 1024) {
		return `${formatNumber(bytes / 1024, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} KB`;
	}

	return `${formatNumber(bytes / (1024 * 1024), locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`;
}
