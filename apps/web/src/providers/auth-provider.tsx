"use client";

import {
	hasAllPermissions,
	hasAnyPermission,
	hasOnePermission,
	Permission,
} from "@ecommand/shared";
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
	const permissions = new Set(user.permissions as Permission[]);

	const value: AuthContextType = {
		user,

		hasPermission: (permission) => hasOnePermission(permissions, permission),

		hasAnyPermission: (...permissionsToCheck) =>
			hasAnyPermission(permissions, ...permissionsToCheck),

		hasAllPermissions: (...permissionsToCheck) =>
			hasAllPermissions(permissions, ...permissionsToCheck),
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
