import { Injectable } from "@nestjs/common";
import { passwordResetTokens, userSessions, users } from "drizzle/schema";
import { eq } from "drizzle-orm";
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

	async revokeAllUserSessions(userId: UserId) {
		await this.drizzle.db
			.update(userSessions)
			.set({
				logoutAt: new Date().toISOString(),
			})
			.where(eq(userSessions.userId, userId));
	}

	async updateUserPassword(id: UserId, password: string) {
		await this.drizzle.db
			.update(users)
			.set({ password })
			.where(eq(users.id, id));
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

	async findValidResetToken(token: string) {
		return this.drizzle.db.query.passwordResetTokens.findFirst({
			where: {
				token,
				used: false,
			},
		});
	}

	async markResetTokenAsUsed(id: number) {
		await this.drizzle.db
			.update(passwordResetTokens)
			.set({ used: true })
			.where(eq(passwordResetTokens.id, id));
	}
}
