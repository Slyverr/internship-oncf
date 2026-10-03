import { RegistrationStatus } from "@ecommand/shared";
import { Injectable } from "@nestjs/common";
import { passwordResetTokens, userSessions, users } from "drizzle/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import type { UserId } from "@/users/users.types";

@Injectable()
export class AuthQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async createSession(userId: UserId, sessionToken: string, expiredAt: string) {
		await this.drizzle.db.insert(userSessions).values({
			userId,
			sessionToken,
			expiredAt,
		});
	}

	async findSession(sessionToken: string, userId: UserId) {
		return this.drizzle.db.query.userSessions.findFirst({
			where: {
				sessionToken,
				userId,
			},
		});
	}

	async logoutSession(sessionToken: string) {
		await this.drizzle.db
			.update(userSessions)
			.set({
				logoutAt: new Date().toISOString(),
			})
			.where(eq(userSessions.sessionToken, sessionToken));
	}

	async recordFailedLoginAttempt(
		userId: UserId,
		maxAttempts: number,
		lockDurationSeconds: number,
		now = new Date(),
	) {
		const nowIso = now.toISOString();
		const lockUntil = new Date(
			now.getTime() + lockDurationSeconds * 1000,
		).toISOString();
		const expiredLock = and(
			sql`${users.accountLockedUntil} IS NOT NULL`,
			lte(users.accountLockedUntil, nowIso),
		);

		const [updated] = await this.drizzle.db
			.update(users)
			.set({
				failedLoginAttempts: sql<number>`CASE WHEN ${expiredLock} THEN 1 ELSE COALESCE(${users.failedLoginAttempts}, 0) + 1 END`,
				accountLockedUntil: sql<
					string | null
				>`CASE WHEN ${expiredLock} THEN CASE WHEN ${maxAttempts} <= 1 THEN ${lockUntil} ELSE NULL END WHEN COALESCE(${users.failedLoginAttempts}, 0) + 1 >= ${maxAttempts} THEN ${lockUntil} ELSE ${users.accountLockedUntil} END`,
			})
			.where(
				and(
					eq(users.id, userId),
					eq(users.isActive, true),
					eq(users.registrationStatus, RegistrationStatus.APPROVED),
				),
			)
			.returning({
				failedLoginAttempts: users.failedLoginAttempts,
				accountLockedUntil: users.accountLockedUntil,
			});
		return updated;
	}

	async resetFailedLoginAttempts(userId: UserId) {
		await this.drizzle.db
			.update(users)
			.set({ failedLoginAttempts: 0, accountLockedUntil: null })
			.where(eq(users.id, userId));
	}

	async updatePasswordAndRevokeSessions(userId: UserId, password: string) {
		await this.drizzle.db.transaction(async (tx) => {
			const now = new Date().toISOString();
			await tx
				.update(users)
				.set({
					password,
					failedLoginAttempts: 0,
					accountLockedUntil: null,
				})
				.where(eq(users.id, userId));
			await tx
				.update(userSessions)
				.set({ logoutAt: now })
				.where(eq(userSessions.userId, userId));
		});
	}

	async findUserByEmail(email: string) {
		return this.drizzle.db.query.users.findFirst({
			where: { email },
			columns: {
				id: true,
				email: true,
			},
		});
	}

	async createPasswordResetToken(
		userId: UserId,
		token: string,
		expiresAt: string,
	) {
		await this.drizzle.db.insert(passwordResetTokens).values({
			userId,
			token,
			expiresAt,
			used: false,
		});
	}

	async findPasswordResetToken(token: string) {
		return this.drizzle.db.query.passwordResetTokens.findFirst({
			where: { token },
		});
	}

	async resetPassword(token: string, password: string) {
		return this.drizzle.db.transaction(async (tx) => {
			const resetToken = await tx.query.passwordResetTokens.findFirst({
				where: { token },
			});
			const now = new Date();

			if (!resetToken || resetToken.used) return "invalid" as const;
			if (new Date(resetToken.expiresAt) < now) return "expired" as const;

			const [consumedToken] = await tx
				.update(passwordResetTokens)
				.set({ used: true })
				.where(
					and(
						eq(passwordResetTokens.id, resetToken.id),
						eq(passwordResetTokens.token, token),
						eq(passwordResetTokens.used, false),
						gte(passwordResetTokens.expiresAt, now.toISOString()),
					),
				)
				.returning({ userId: passwordResetTokens.userId });

			if (!consumedToken) {
				const currentToken = await tx.query.passwordResetTokens.findFirst({
					where: { token },
				});
				return currentToken &&
					!currentToken.used &&
					new Date(currentToken.expiresAt) < now
					? ("expired" as const)
					: ("invalid" as const);
			}

			await tx
				.update(users)
				.set({
					password,
					failedLoginAttempts: 0,
					accountLockedUntil: null,
				})
				.where(eq(users.id, consumedToken.userId));
			await tx
				.update(userSessions)
				.set({ logoutAt: now.toISOString() })
				.where(eq(userSessions.userId, consumedToken.userId));

			return "success" as const;
		});
	}
}
