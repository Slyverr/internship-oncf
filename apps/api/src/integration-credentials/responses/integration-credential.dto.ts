import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class IntegrationCredentialDto {
	@ApiProperty()
	id!: number;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	keyId!: string;

	@ApiProperty({ type: [String] })
	permissions!: string[];

	@ApiProperty()
	createdAt!: string;

	@ApiPropertyOptional({ nullable: true })
	lastUsedAt!: string | null;

	@ApiPropertyOptional({ nullable: true })
	revokedAt!: string | null;
}

export class CreatedIntegrationCredentialDto extends IntegrationCredentialDto {
	/** Displayed only once when the credential is created or rotated. */
	@ApiProperty()
	secret!: string;
}

export class RevokedIntegrationCredentialDto {
	@ApiProperty()
	id!: number;

	@ApiProperty()
	revoked!: boolean;
}
