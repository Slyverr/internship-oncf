"use server";

import type { ApiResponseCode } from "@ecommand/shared";
import { isStrongPassword } from "@ecommand/shared";
import { type MessageKey, Messages } from "@/i18n";
import type { SuccessResponseDto } from "@/lib/api/generated.schemas";
import { customFetch } from "@/lib/axios";

export type ResetPasswordState = {
	successCode?: ApiResponseCode;
	errorKey?: MessageKey;
};

export async function resetPasswordAction(
	token: string,
	_prevState: ResetPasswordState | null,
	formData: FormData,
): Promise<ResetPasswordState> {
	const password = String(formData.get("password") ?? "");
	const confirmation = String(formData.get("confirmation") ?? "");

	if (password !== confirmation) {
		return { errorKey: Messages.auth.recovery.passwordMismatch };
	}
	if (!isStrongPassword(password)) {
		return { errorKey: Messages.auth.passwordHint };
	}
	if (!token) {
		return { errorKey: Messages.auth.recovery.invalidLink };
	}

	try {
		const response = await customFetch<SuccessResponseDto>({
			url: "/auth/reset-password",
			method: "POST",
			headers: { "Content-Type": "application/json" },
			data: { token, newPassword: password },
		});
		return { successCode: response.code };
	} catch {
		return {
			errorKey: Messages.auth.recovery.invalidLinkHelp,
		};
	}
}
