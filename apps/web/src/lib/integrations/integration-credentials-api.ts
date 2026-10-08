import type {
	CreatedIntegrationCredentialDto,
	CreateIntegrationCredentialDtoPermissionsItem,
	IntegrationCredentialDto,
} from "@/lib/api/generated.schemas";
import {
	integrationCredentialsControllerCreate,
	integrationCredentialsControllerList,
	integrationCredentialsControllerRevoke,
	integrationCredentialsControllerRotate,
} from "@/lib/api/integration-credentials";

export type IntegrationCredential = IntegrationCredentialDto;
export type IssuedIntegrationCredential = CreatedIntegrationCredentialDto;

export const integrationCredentialsApi = {
	list: () => integrationCredentialsControllerList(),
	create: (
		name: string,
		permissions: CreateIntegrationCredentialDtoPermissionsItem[],
	) => integrationCredentialsControllerCreate({ name, permissions }),
	rotate: (id: number) => integrationCredentialsControllerRotate(id),
	revoke: (id: number) => integrationCredentialsControllerRevoke(id),
};
