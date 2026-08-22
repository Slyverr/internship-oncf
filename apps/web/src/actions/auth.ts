"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authControllerGetProfile } from "@/lib/api/auth";

export const getCurrentUser = cache(async () => {
	try {
		return await authControllerGetProfile();
	} catch (_) {
		return null;
	}
});

export const logout = async () => {
	const cookieStore = await cookies();
	cookieStore.delete("access_token");

	redirect("/login");
};
