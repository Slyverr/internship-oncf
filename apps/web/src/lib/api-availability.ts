import { API_TRANSPORT_ERROR_CODES } from "@ecommand/shared";

type ApiErrorShape = {
	response?: {
		status?: number;
		data?: { code?: string };
	};
};

function getApiError(error: unknown): ApiErrorShape {
	return error && typeof error === "object" ? (error as ApiErrorShape) : {};
}

export function isApiUnavailableError(error: unknown): boolean {
	return (
		getApiError(error).response?.data?.code ===
		API_TRANSPORT_ERROR_CODES.API_UNAVAILABLE
	);
}

export function shouldRetryApiRequest(
	failureCount: number,
	error: unknown,
): boolean {
	const status = getApiError(error).response?.status;
	const isTransient =
		status === undefined || status >= 500 || status === 408 || status === 429;
	return isTransient && failureCount < 2;
}
