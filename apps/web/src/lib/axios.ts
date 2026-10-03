import { API_TRANSPORT_ERROR_CODES } from "@ecommand/shared";
import axios, { AxiosRequestConfig } from "axios";
import { isApiUnavailableError } from "./api-availability";
import { sanitizeApiError } from "./safe-api-error";

export async function customFetch<T>(
	config: AxiosRequestConfig,
	options?: AxiosRequestConfig,
): Promise<T> {
	const isServer = typeof window === "undefined";
	const token = isServer
		? (await (await import("next/headers")).cookies()).get("access_token")
				?.value
		: undefined;

	try {
		const { data } = await axios<T>({
			...config,
			...options,
			baseURL: isServer
				? (process.env.BACKEND_API_URL ?? "http://localhost:8000")
				: "/api/proxy",
			withCredentials: !isServer,
			headers: {
				...config.headers,
				...options?.headers,
				...(token && { Authorization: `Bearer ${token}` }),
			},
		});

		return data;
	} catch (error) {
		const safeError = sanitizeApiError(error);
		if (
			isServer &&
			safeError instanceof Error &&
			isApiUnavailableError(safeError)
		) {
			// Next.js serializes the error message across the server boundary. Keep
			// this marker machine-readable; ErrorPage resolves it through the catalog.
			safeError.message = API_TRANSPORT_ERROR_CODES.API_UNAVAILABLE;
		}
		throw safeError;
	}
}

export default customFetch;
