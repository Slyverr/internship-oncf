"use client";

import {
	hasAllPermissions,
	hasAnyPermission,
	hasOnePermission,
	Permission,
} from "@ecommand/shared";
import { createContext, ReactNode, useContext, useState } from "react";
import { ProfileDto } from "@/lib/api/generated.schemas";

export interface AuthProviderProps {
	profile: ProfileDto;
	children: ReactNode;
}

export interface AuthContextType {
	profile: ProfileDto;
	setProfile: (profile: ProfileDto) => void;
	hasPermission: (permission: Permission) => boolean;
	hasAnyPermission: (...permissions: Permission[]) => boolean;
	hasAllPermissions: (...permissions: Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
	profile: initialProfile,
	children,
}: AuthProviderProps) {
	const [profile, setProfile] = useState(initialProfile);

	const permissions = new Set(profile.permissions as Permission[]);

	const value: AuthContextType = {
		profile,
		setProfile,
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
