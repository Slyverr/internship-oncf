export function getFormErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	if (typeof error === "string") return error;
	if (typeof error === "object" && "message" in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === "string") return message;
	}
	return String(error);
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

export function omitFormStepError(
	errors: Record<string, string>,
	fieldName: string,
): Record<string, string> {
	if (!errors[fieldName]) return errors;
	const { [fieldName]: _removed, ...remaining } = errors;
	return remaining;
}
