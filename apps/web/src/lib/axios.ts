import axios, { AxiosRequestConfig } from "axios";

export async function customFetch<T>(
	config: AxiosRequestConfig,
	options?: AxiosRequestConfig,
): Promise<T> {
	const isServer = typeof window === "undefined";
	const token = isServer
		? (await (await import("next/headers")).cookies()).get("access_token")
				?.value
		: undefined;

	const { data } = await axios<T>({
		...config,
		...options,
		baseURL: isServer ? process.env.BACKEND_API_URL : "/api/proxy",
		withCredentials: !isServer,
		headers: {
			...config.headers,
			...options?.headers,
			...(token && { Authorization: `Bearer ${token}` }),
		},
	});

	return data;
}

export default customFetch;
