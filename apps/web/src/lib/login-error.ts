import { API_ERROR_CODES } from "@ecommand/shared";
import { isAxiosError } from "axios";
import { type MessageKey, Messages } from "@/i18n";

export function getLoginErrorKey(error: unknown): MessageKey {
	const code = isAxiosError(error) ? error.response?.data?.code : undefined;
	switch (code) {
		case API_ERROR_CODES.AUTHENTICATION_REQUIRED:
			return Messages.auth.login.invalidCredentials;
		case API_ERROR_CODES.RATE_LIMITED:
			return Messages.auth.login.tooManyAttempts;
		case API_ERROR_CODES.INTERNAL_ERROR:
			return Messages.auth.login.serverError;
		default:
			return isAxiosError(error) && !error.response
				? Messages.auth.login.networkError
				: Messages.apiError.requestFailed;
	}
}
