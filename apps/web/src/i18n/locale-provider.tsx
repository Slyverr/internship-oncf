"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import {
	type AppLocale,
	createTranslator,
	DEFAULT_LOCALE,
	SUPPORTED_LOCALES,
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
	return useMemo(() => createTranslator(locale), [locale]);
}
