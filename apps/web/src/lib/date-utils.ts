export function formatDisplayDate(value?: string | null): string {
	return value ? new Date(value).toLocaleDateString() : "—";
}

export function formatDisplayDateTime(value?: string | null): string {
	return value ? new Date(value).toLocaleString() : "—";
}

export function toDateInputValue(value?: string | null): string {
	return value?.slice(0, 10) ?? "";
}
