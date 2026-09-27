function getMessage(value: unknown): string | undefined {
	if (typeof value === "string") return value;
	if (Array.isArray(value)) {
		const messages = value.filter(
			(item): item is string => typeof item === "string",
		);
		return messages.length > 0 ? messages.join(". ") : undefined;
	}
	return undefined;
}

function getProperty(value: unknown, key: string): unknown {
	if (typeof value !== "object" || value === null || !(key in value)) {
		return undefined;
	}
	return (value as Record<string, unknown>)[key];
}

export function getFormErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	const responseMessage = getProperty(
		getProperty(getProperty(error, "response"), "data"),
		"message",
	);
	return (
		getMessage(responseMessage) ??
		getMessage(getProperty(error, "message")) ??
		String(error)
	);
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
