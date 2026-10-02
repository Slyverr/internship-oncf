export const STRONG_PASSWORD_MIN_LENGTH = 8;
export const STRONG_PASSWORD_MAX_LENGTH = 255;
export const STRONG_PASSWORD_PATTERN = new RegExp(
	`^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{${STRONG_PASSWORD_MIN_LENGTH},}$`,
);

export const STRONG_PASSWORD_REQUIREMENTS = [
	{
		id: "minimum-length",
		isMet: (value: string) => value.length >= STRONG_PASSWORD_MIN_LENGTH,
	},
	{
		id: "lowercase",
		isMet: (value: string) => /[a-z]/.test(value),
	},
	{
		id: "uppercase",
		isMet: (value: string) => /[A-Z]/.test(value),
	},
	{
		id: "number",
		isMet: (value: string) => /\d/.test(value),
	},
	{
		id: "symbol",
		isMet: (value: string) => /[^A-Za-z0-9]/.test(value),
	},
	{
		id: "maximum-length",
		isMet: (value: string) =>
			value.length > 0 && value.length <= STRONG_PASSWORD_MAX_LENGTH,
	},
] as const;

export function isStrongPassword(value: string): boolean {
	return STRONG_PASSWORD_REQUIREMENTS.every(({ isMet }) => isMet(value));
}
