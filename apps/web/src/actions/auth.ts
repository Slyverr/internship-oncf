"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { profileControllerGetCurrent } from "@/lib/api/profile";

export const getCurrentUser = cache(async () => {
	try {
		return await profileControllerGetCurrent();
	} catch (_) {
		return null;
	}
});

export const logout = async () => {
	const cookieStore = await cookies();
	cookieStore.delete("access_token");

	redirect("/login");
};
