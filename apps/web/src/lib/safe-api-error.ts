import { API_ERROR_CODES } from "@ecommand/shared";
import axios from "axios";
import { Messages, translate, translateApiError } from "@/i18n";

type SafeApiError = Error & {
	code?: string;
	isAxiosError?: true;
	response?: {
		status: number;
		data?: { code?: unknown; statusCode?: unknown; details?: unknown };
	};
};

export function sanitizeApiError(error: unknown): unknown {
	if (!axios.isAxiosError(error)) return error;

	const responseCode = error.response?.data?.code;
	const safeError = new Error(
		error.response
			? translateApiError(
					typeof responseCode === "string" ? responseCode : undefined,
					error.response.status,
				)
			: error.code === "ERR_CANCELED"
				? translate(Messages.transport.requestCanceled)
				: translate(Messages.transport.apiUnavailable),
	) as SafeApiError;

	safeError.isAxiosError = true;
	if (error.code) safeError.code = error.code;

	if (error.response) {
		const data = error.response.data;
		const responseData = {
			...(typeof data?.code === "string" && { code: data.code }),
			...(typeof data?.statusCode === "number" && {
				statusCode: data.statusCode,
			}),
			...(data?.details !== undefined && { details: data.details }),
		};

		safeError.response = {
			status: error.response.status,
			data: responseData,
		};
	}

	return safeError;
}

export function isAccessDeniedApiError(error: unknown): boolean {
	if (!axios.isAxiosError(error)) return false;

	const apiError = error as SafeApiError;
	return apiError.response?.data?.code === API_ERROR_CODES.ACCESS_DENIED;
}
