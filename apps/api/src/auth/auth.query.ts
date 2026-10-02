import { Injectable } from "@nestjs/common";
import { passwordResetTokens, userSessions, users } from "drizzle/schema";
import { and, eq, gte } from "drizzle-orm";
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

	async updatePasswordAndRevokeSessions(userId: UserId, password: string) {
		await this.drizzle.db.transaction(async (tx) => {
			const now = new Date().toISOString();
			await tx.update(users).set({ password }).where(eq(users.id, userId));
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
				.set({ password })
				.where(eq(users.id, consumedToken.userId));
			await tx
				.update(userSessions)
				.set({ logoutAt: now.toISOString() })
				.where(eq(userSessions.userId, consumedToken.userId));

			return "success" as const;
		});
	}
}
