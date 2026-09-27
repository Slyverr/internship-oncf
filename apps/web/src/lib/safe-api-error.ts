import axios from "axios";

type SafeApiError = Error & {
	code?: string;
	isAxiosError?: true;
	response?: {
		status: number;
		data?: { message?: unknown };
	};
};

export function sanitizeApiError(error: unknown): unknown {
	if (!axios.isAxiosError(error)) return error;

	const safeError = new Error(
		error.response
			? error.message
			: error.code === "ERR_CANCELED"
				? "Request was canceled."
				: "The ECommand API could not be reached.",
	) as SafeApiError;

	safeError.isAxiosError = true;
	if (error.code) safeError.code = error.code;

	if (error.response) {
		const data = error.response.data;
		const responseMessage =
			typeof data === "object" && data !== null && "message" in data
				? { message: data.message }
				: undefined;

		safeError.response = {
			status: error.response.status,
			...(responseMessage && { data: responseMessage }),
		};
	}

	return safeError;
}
