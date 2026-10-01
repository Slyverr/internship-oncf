"use client";

import { useCallback } from "react";
import { useLocale } from "@/i18n/locale-provider";
import { getFormErrorMessage } from "@/lib/form-utils";

export function useFormErrorMessage() {
	const locale = useLocale();
	return useCallback(
		(error: unknown, overrideLocale = locale) =>
			getFormErrorMessage(error, overrideLocale),
		[locale],
	);
}
