export class IntegrationCredentialDto {
	id: number;
	name: string;
	keyId: string;
	permissions: string[];
	createdAt: string;
	lastUsedAt: string | null;
	revokedAt: string | null;
}

export class CreatedIntegrationCredentialDto extends IntegrationCredentialDto {
	/** Displayed only once when the credential is created or rotated. */
	secret: string;
}
