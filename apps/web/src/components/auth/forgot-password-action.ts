"use server";

import type { ApiResponseCode } from "@ecommand/shared";
import { type MessageKey, Messages } from "@/i18n";
import type { SuccessResponseDto } from "@/lib/api/generated.schemas";
import { customFetch } from "@/lib/axios";

export type ForgotPasswordState = {
	successCode?: ApiResponseCode;
	errorKey?: MessageKey;
};

export async function forgotPasswordAction(
	_prevState: ForgotPasswordState | null,
	formData: FormData,
): Promise<ForgotPasswordState> {
	const email = String(formData.get("email") ?? "").trim();
	if (!/^\S+@\S+\.\S+$/.test(email)) {
		return { errorKey: Messages.auth.recovery.emailInvalid };
	}

	try {
		const response = await customFetch<SuccessResponseDto>({
			url: "/auth/forgot-password",
			method: "POST",
			headers: { "Content-Type": "application/json" },
			data: { email },
		});
		return { successCode: response.code };
	} catch {
		return { errorKey: Messages.auth.recovery.requestFailed };
	}
}
