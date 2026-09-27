"use server";

import { isStrongPassword, STRONG_PASSWORD_HINT } from "@ecommand/shared";
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
	if (!isStrongPassword(password)) {
		return { error: STRONG_PASSWORD_HINT };
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
