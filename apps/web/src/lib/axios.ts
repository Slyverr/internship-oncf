import axios, { AxiosRequestConfig } from "axios";
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
		throw sanitizeApiError(error);
	}
}

export default customFetch;
