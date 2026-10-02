import "server-only";
import { cookies } from "next/headers";
import { createTranslator, resolveAppLocale } from ".";

export const LOCALE_COOKIE = "ecommand-locale";

export async function getRequestLocale() {
	const value = (await cookies()).get(LOCALE_COOKIE)?.value;
	return resolveAppLocale(value);
}

export async function getRequestTranslator() {
	const locale = await getRequestLocale();
	return createTranslator(locale);
}
