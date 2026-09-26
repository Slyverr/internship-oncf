"use server";

import { customFetch } from "@/lib/axios";

export type ForgotPasswordState = {
	success?: boolean;
	error?: string;
};

export async function forgotPasswordAction(
	_prevState: ForgotPasswordState | null,
	formData: FormData,
): Promise<ForgotPasswordState> {
	const email = String(formData.get("email") ?? "").trim();
	if (!/^\S+@\S+\.\S+$/.test(email)) {
		return { error: "Enter a valid email address." };
	}

	try {
		await customFetch({
			url: "/auth/forgot-password",
			method: "POST",
			headers: { "Content-Type": "application/json" },
			data: { email },
		});
		return { success: true };
	} catch {
		return { error: "We could not process your request. Please try again." };
	}
}
