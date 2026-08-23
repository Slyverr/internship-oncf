"use client";

import { Permission } from "@ecommand/shared";
import { createContext, ReactNode, useContext } from "react";
import { ProfileDto } from "@/lib/api/generated.schemas";

interface AuthContextType {
	user: ProfileDto;
	hasPermissions: (...permissions: Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
	user,
	children,
}: {
	user: ProfileDto;
	children: ReactNode;
}) {
	const value: AuthContextType = {
		user,

		hasPermissions: (...permissions) =>
			permissions.every((permission) => user.permissions.includes(permission)),
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}

	return context;
}
