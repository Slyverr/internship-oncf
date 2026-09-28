import { Role } from "@ecommand/shared";

const roleLabels: Record<Role, string> = {
	[Role.ADMIN]: "Administrator",
	[Role.AGENT_COMMERCIAL]: "Commercial agent",
	[Role.CLIENT_REPRESENTATIVE]: "Client representative",
};

const userTypeLabels = {
	internal: "Internal",
	external: "External",
};

function formatUnknownLabel(value: string) {
	return value
		.toLowerCase()
		.replaceAll("_", " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatUserRole(role: string | null | undefined) {
	if (!role) return "—";
	return roleLabels[role as Role] ?? formatUnknownLabel(role);
}

export function formatUserType(type: string | null | undefined) {
	if (!type) return "—";
	return (
		userTypeLabels[type as keyof typeof userTypeLabels] ??
		formatUnknownLabel(type)
	);
}
