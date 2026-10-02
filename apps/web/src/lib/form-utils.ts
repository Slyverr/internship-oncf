import { API_ERROR_CODES } from "@ecommand/shared";
import {
	type AppLocale,
	DEFAULT_LOCALE,
	type MessageKey,
	Messages,
	translate,
	translateApiError,
	translateApiValidationRule,
} from "@/i18n";
import { sanitizeApiError } from "@/lib/safe-api-error";

function getProperty(value: unknown, key: string): unknown {
	if (typeof value !== "object" || value === null || !(key in value)) {
		return undefined;
	}
	return (value as Record<string, unknown>)[key];
}

function getValidationFields(value: unknown): Record<string, string[]> {
	const fields = getProperty(value, "fields");
	if (typeof fields !== "object" || fields === null || Array.isArray(fields)) {
		return {};
	}
	return Object.fromEntries(
		Object.entries(fields).flatMap(([field, rules]) => {
			if (!Array.isArray(rules)) return [];
			const codes = rules.filter(
				(rule): rule is string => typeof rule === "string",
			);
			return codes.length > 0 ? [[field, codes]] : [];
		}),
	);
}

function summarizeValidationFields(
	details: unknown,
	locale: AppLocale,
): string | undefined {
	const entries = Object.entries(getValidationFields(details));
	if (entries.length === 0) return undefined;
	const summaries: string[] = [];
	for (const [path, rules] of entries) {
		const fieldName = path.split(".").at(-1);
		const fieldKey = fieldName
			? Messages.common.fields[fieldName as keyof typeof Messages.common.fields]
			: undefined;
		if (!fieldKey) return undefined;
		const field = translate(fieldKey as MessageKey, {}, locale);
		const ruleDescriptions = [...new Set(rules)]
			.map((code) => translateApiValidationRule(code, locale))
			.join(", ");
		summaries.push(`${field}: ${ruleDescriptions}`);
	}
	return summaries.length > 0
		? translate(
				Messages.apiError.validationFields,
				{ fields: summaries.join("; ") },
				locale,
			)
		: undefined;
}

export function getFormErrorMessage(
	error: unknown,
	locale: AppLocale = DEFAULT_LOCALE,
): string | undefined {
	if (!error) return undefined;
	const safeError = sanitizeApiError(error);
	const responseData = getProperty(getProperty(safeError, "response"), "data");
	const responseCode = getProperty(responseData, "code");
	const responseStatus = getProperty(
		getProperty(safeError, "response"),
		"status",
	);
	if (typeof responseCode === "string") {
		if (responseCode === API_ERROR_CODES.VALIDATION_FAILED) {
			const validationSummary = summarizeValidationFields(
				getProperty(responseData, "details"),
				locale,
			);
			if (validationSummary) return validationSummary;
		}
		return translateApiError(
			responseCode,
			typeof responseStatus === "number" ? responseStatus : undefined,
			locale,
		);
	}
	if (getProperty(safeError, "isAxiosError") === true) {
		if (!getProperty(safeError, "response")) {
			const transportMessage =
				getProperty(safeError, "code") === "ERR_CANCELED"
					? Messages.transport.requestCanceled
					: Messages.transport.apiUnavailable;
			return translate(transportMessage, {}, locale);
		}
		const status = getProperty(getProperty(safeError, "response"), "status");
		return translateApiError(
			undefined,
			typeof status === "number" ? status : undefined,
			locale,
		);
	}
	return translate(Messages.apiError.requestFailed, {}, locale);
}

export function getFormStepErrors(
	issues: readonly { path: readonly unknown[]; message: string }[],
): Record<string, string> {
	const errors: Record<string, string> = {};
	for (const issue of issues) {
		const fieldName = issue.path[0];
		if (fieldName !== undefined) errors[String(fieldName)] = issue.message;
	}
	return errors;
}

export function getFirstFormStepErrorField(
	issues: readonly { path: readonly unknown[]; message: string }[],
): string | undefined {
	for (const issue of issues) {
		if (typeof issue.path[0] === "string") return issue.path[0];
	}

	return undefined;
}

export function omitFormStepError(
	errors: Record<string, string>,
	fieldName: string,
): Record<string, string> {
	if (!errors[fieldName]) return errors;
	const { [fieldName]: _removed, ...remaining } = errors;
	return remaining;
}
