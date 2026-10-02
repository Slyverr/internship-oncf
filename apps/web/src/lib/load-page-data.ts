import { isAccessDeniedApiError } from "@/lib/safe-api-error";

export async function loadPageData<T>(request: Promise<T>): Promise<T | null> {
	try {
		return await request;
	} catch (error) {
		if (isAccessDeniedApiError(error)) return null;
		throw error;
	}
}
