export const STRONG_PASSWORD_PATTERN =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const STRONG_PASSWORD_HINT =
	"Use at least 8 characters with uppercase and lowercase letters, a number, and a symbol.";

export function isStrongPassword(value: string): boolean {
	return STRONG_PASSWORD_PATTERN.test(value);
}
