export function escapeCsvCell(value: string | number): string {
	const text = String(value);
	const safeText = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
	return `"${safeText.replaceAll('"', '""')}"`;
}

export function csvRowsToText(rows: Array<Array<string | number>>): string {
	return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}
