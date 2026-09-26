"use server";

import { customFetch } from "@/lib/axios";

export type ResetPasswordState = {
	success?: boolean;
	error?: string;
};

export async function resetPasswordAction(
	token: string,
	_prevState: ResetPasswordState | null,
	formData: FormData,
): Promise<ResetPasswordState> {
	const password = String(formData.get("password") ?? "");
	const confirmation = String(formData.get("confirmation") ?? "");

	if (password !== confirmation) {
		return { error: "The passwords do not match." };
	}
	if (
		password.length < 8 ||
		!/[a-z]/.test(password) ||
		!/[A-Z]/.test(password) ||
		!/[0-9]/.test(password) ||
		!/[^a-zA-Z0-9]/.test(password)
	) {
		return {
			error:
				"Use at least 8 characters, with upper and lowercase letters, a number, and a symbol.",
		};
	}
	if (!token) {
		return { error: "This reset link is invalid or has expired." };
	}

	try {
		await customFetch({
			url: "/auth/reset-password",
			method: "POST",
			headers: { "Content-Type": "application/json" },
			data: { token, newPassword: password },
		});
		return { success: true };
	} catch {
		return {
			error:
				"This reset link is invalid or has expired. Request a new link and try again.",
		};
	}
}
