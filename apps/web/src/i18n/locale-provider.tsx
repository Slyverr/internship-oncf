"use client";

import { createContext, type ReactNode, useCallback, useContext } from "react";
import {
	type AppLocale,
	DEFAULT_LOCALE,
	type MessageKey,
	SUPPORTED_LOCALES,
	translate,
} from ".";

const LocaleContext = createContext<AppLocale>(DEFAULT_LOCALE);

export function LocaleProvider({
	children,
	locale = DEFAULT_LOCALE,
}: {
	children: ReactNode;
	locale?: AppLocale;
}) {
	const supportedLocale = SUPPORTED_LOCALES.includes(locale)
		? locale
		: DEFAULT_LOCALE;
	return (
		<LocaleContext.Provider value={supportedLocale}>
			{children}
		</LocaleContext.Provider>
	);
}

export function useLocale(): AppLocale {
	return useContext(LocaleContext);
}

export function useTranslate() {
	const locale = useLocale();
	return useCallback(
		(key: MessageKey, values: Record<string, string | number> = {}) =>
			translate(key, values, locale),
		[locale],
	);
}
