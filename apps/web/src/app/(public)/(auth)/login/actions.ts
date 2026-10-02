"use server";

import { cookies } from "next/headers";
import { type MessageKey, Messages } from "@/i18n";
import { authControllerLogin } from "@/lib/api/auth";
import { getLoginErrorKey } from "@/lib/login-error";

export type LoginState = {
	errors?: {
		username?: MessageKey;
		password?: MessageKey;
		form?: MessageKey;
	};
	success?: boolean;
	data?: {
		username: string;
		remember: boolean;
	};
};

export async function loginAction(
	_prevState: LoginState | null,
	formData: FormData,
): Promise<LoginState> {
	const username = String(formData.get("username") ?? "").trim();
	const password = formData.get("password") as string;
	const remember = formData.get("remember") === "on";

	const errors: LoginState["errors"] = {};

	if (!username) {
		errors.username = Messages.auth.login.usernameRequired;
	}

	if (!password || password.length < 8) {
		errors.password = password
			? Messages.auth.login.passwordTooShort
			: Messages.auth.login.passwordRequired;
	}

	if (errors.username || errors.password) {
		return {
			errors,
			success: false,
			data: { username, remember },
		};
	}

	try {
		const response = await authControllerLogin({
			username,
			password,
		});

		const accessToken = response.access_token;
		if (!accessToken) {
			return {
				errors: {
					form: Messages.auth.login.invalidCredentials,
				},
				success: false,
				data: { username, remember },
			};
		}

		const cookieStore = await cookies();
		cookieStore.set("access_token", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: remember ? 60 * 60 * 24 * 7 : 60 * 60 * 24,
			path: "/",
		});

		return {
			success: true,
			data: { username, remember },
		};
	} catch (error: unknown) {
		return {
			errors: {
				form: getLoginErrorKey(error),
			},
			success: false,
			data: { username, remember },
		};
	}
}
