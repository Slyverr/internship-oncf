import { customFetch } from "@/lib/axios";

export type IntegrationCredential = {
	id: number;
	name: string;
	keyId: string;
	permissions: string[];
	createdAt: string;
	lastUsedAt: string | null;
	revokedAt: string | null;
};

export type IssuedIntegrationCredential = IntegrationCredential & {
	secret: string;
};

export const integrationCredentialsApi = {
	list: () =>
		customFetch<IntegrationCredential[]>({
			url: "/integration-credentials",
			method: "GET",
		}),
	create: (name: string, permissions: string[]) =>
		customFetch<IssuedIntegrationCredential>({
			url: "/integration-credentials",
			method: "POST",
			data: { name, permissions },
		}),
	rotate: (id: number) =>
		customFetch<IssuedIntegrationCredential>({
			url: `/integration-credentials/${id}/rotate`,
			method: "POST",
		}),
	revoke: (id: number) =>
		customFetch<{ id: number; revoked: boolean }>({
			url: `/integration-credentials/${id}/revoke`,
			method: "PATCH",
		}),
};
