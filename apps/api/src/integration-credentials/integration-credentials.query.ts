import { Injectable } from "@nestjs/common";
import { integrationCredentials } from "drizzle/schema";
import { and, eq, isNull } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";

@Injectable()
export class IntegrationCredentialsQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	findAll() {
		return this.drizzle.db.query.integrationCredentials.findMany({
			columns: {
				id: true,
				name: true,
				keyId: true,
				permissions: true,
				createdAt: true,
				lastUsedAt: true,
				revokedAt: true,
			},
			orderBy: (credential, { desc }) => [desc(credential.createdAt)],
		});
	}

	async create(values: {
		name: string;
		keyId: string;
		secretHash: string;
		permissions: string[];
		createdByUserId: number;
	}) {
		const [credential] = await this.drizzle.db
			.insert(integrationCredentials)
			.values(values)
			.returning({
				id: integrationCredentials.id,
				name: integrationCredentials.name,
				keyId: integrationCredentials.keyId,
				permissions: integrationCredentials.permissions,
				createdAt: integrationCredentials.createdAt,
				lastUsedAt: integrationCredentials.lastUsedAt,
				revokedAt: integrationCredentials.revokedAt,
			});
		return credential;
	}

	findByKeyId(keyId: string) {
		return this.drizzle.db.query.integrationCredentials.findFirst({
			where: { keyId },
		});
	}

	async touch(id: number) {
		await this.drizzle.db
			.update(integrationCredentials)
			.set({ lastUsedAt: new Date().toISOString() })
			.where(eq(integrationCredentials.id, id));
	}

	async revoke(id: number, actorUserId: number) {
		const [credential] = await this.drizzle.db
			.update(integrationCredentials)
			.set({
				revokedAt: new Date().toISOString(),
				revokedByUserId: actorUserId,
			})
			.where(
				and(
					eq(integrationCredentials.id, id),
					isNull(integrationCredentials.revokedAt),
				),
			)
			.returning({ id: integrationCredentials.id });
		return credential;
	}

	async rotate(id: number, secretHash: string, actorUserId: number) {
		const [credential] = await this.drizzle.db
			.update(integrationCredentials)
			.set({
				secretHash,
				rotatedAt: new Date().toISOString(),
				rotatedByUserId: actorUserId,
			})
			.where(
				and(
					eq(integrationCredentials.id, id),
					isNull(integrationCredentials.revokedAt),
				),
			)
			.returning({
				id: integrationCredentials.id,
				name: integrationCredentials.name,
				keyId: integrationCredentials.keyId,
				permissions: integrationCredentials.permissions,
				createdAt: integrationCredentials.createdAt,
				lastUsedAt: integrationCredentials.lastUsedAt,
				revokedAt: integrationCredentials.revokedAt,
			});
		return credential;
	}
}
