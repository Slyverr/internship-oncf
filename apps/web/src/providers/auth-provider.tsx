"use client";

import { Permission } from "@ecommand/shared";
import { createContext, ReactNode, useContext } from "react";
import { ProfileDto } from "@/lib/api/generated.schemas";

interface AuthContextType {
	user: ProfileDto;
	hasPermission: (permission: Permission) => boolean;
	hasAnyPermission: (...permissions: Permission[]) => boolean;
	hasAllPermissions: (...permissions: Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
	user,
	children,
}: {
	user: ProfileDto;
	children: ReactNode;
}) {
	const permissions = new Set(user.permissions);

	const value: AuthContextType = {
		user,

		hasPermission: (permission) => permissions.has(permission),

		hasAnyPermission: (...permissionsToCheck) =>
			permissionsToCheck.some((permission) => permissions.has(permission)),

		hasAllPermissions: (...permissionsToCheck) =>
			permissionsToCheck.every((permission) => permissions.has(permission)),
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
