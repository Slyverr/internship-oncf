"use server";

import { API_ERROR_CODES } from "@ecommand/shared";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { profileControllerGetCurrent } from "@/lib/api/profile";

export const getCurrentProfile = cache(async () => {
	try {
		return await profileControllerGetCurrent();
	} catch (error) {
		const response = (
			error as { response?: { status?: number; data?: { code?: string } } }
		).response;
		if (
			response?.status === 401 ||
			response?.data?.code === API_ERROR_CODES.AUTHENTICATION_REQUIRED
		) {
			return null;
		}
		throw error;
	}
});

export const logout = async () => {
	const cookieStore = await cookies();
	cookieStore.delete("access_token");

	redirect("/login");
};
