import crypto from "node:crypto";
import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { passwordResetTokens, userSessions, users } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "src/database/drizzle.service";
import { EmailService } from "src/email/email.service";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/users.types";
import { AuthUser } from "./auth.types";
import { ChangePasswordDto } from "./requests/change-password.dto";

export interface JwtPayload {
	sub: number;
	sid: string;
}

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly emailService: EmailService,
		private readonly drizzle: DrizzleService,
		private readonly jwtService: JwtService,
	) {}

	async validateUser(email: string, password: string) {
		const user = await this.usersService.findOneByEmail(email);
		if (!user.isActive) return null;

		if (
			user.accountLockedUntil &&
			new Date(user.accountLockedUntil) > new Date()
		) {
			return null;
		}

		const passwordMatches = await bcrypt.compare(password, user.password);
		if (!passwordMatches) {
			return null;
		}

		const { password: _, ...safeUser } = user;
		return safeUser;
	}

	async login(user: Omit<User, "password">) {
		const sessionId = crypto.randomUUID();

		const accessToken = await this.jwtService.signAsync({
			sub: user.id,
			sid: sessionId,
		});

		const payload = this.jwtService.decode(accessToken) as {
			exp: number;
		};

		await this.drizzle.db.insert(userSessions).values({
			userId: user.id,
			sessionToken: sessionId,
			expiredAt: new Date(payload.exp * 1000).toISOString(),
		});

		return {
			access_token: accessToken,
		};
	}

	async validateSession(userId: number, sessionId: string): Promise<AuthUser> {
		const session = await this.drizzle.db.query.userSessions.findFirst({
			where: {
				sessionToken: sessionId,
				userId,
			},
		});

		if (
			!session ||
			session.logoutAt ||
			new Date(session.expiredAt) <= new Date()
		) {
			throw new UnauthorizedException();
		}

		const user = await this.usersService.findOneForAuth(userId);

		if (!user.isActive) {
			throw new UnauthorizedException();
		}

		return {
			id: user.id,
			email: user.email,
			role: user.role,
			permissions: new Set(user.permissions),
			sessionId,
			customerId: user.customerId,
			agencyId: user.agencyId,
		};
	}

	async logout(user: AuthUser) {
		await this.drizzle.db
			.update(userSessions)
			.set({
				logoutAt: new Date().toISOString(),
			})
			.where(eq(userSessions.sessionToken, user.sessionId));
	}

	async changePassword(id: number, dto: ChangePasswordDto) {
		const user = await this.usersService.findOneForAuth(id);

		if (!(await bcrypt.compare(dto.currentPassword, user.password))) {
			throw new BadRequestException("Current password is incorrect");
		}

		const password = await bcrypt.hash(dto.newPassword, 10);

		await this.drizzle.db
			.update(users)
			.set({ password })
			.where(eq(users.id, id));

		await this.drizzle.db
			.update(userSessions)
			.set({
				logoutAt: new Date().toISOString(),
			})
			.where(eq(userSessions.userId, id));
	}

	async forgotPassword(email: string, redirectUrl: string) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { email },
			columns: {
				id: true,
				email: true,
			},
		});

		if (!user) {
			return;
		}

		const token = crypto.randomUUID();
		const expiresAt = new Date();

		expiresAt.setHours(expiresAt.getHours() + 1);

		await this.drizzle.db.insert(passwordResetTokens).values({
			userId: user.id,
			token,
			expiresAt: expiresAt.toISOString(),
			used: false,
		});

		await this.emailService.sendResetPasswordEmail(
			user.email,
			`${redirectUrl}?token=${token}`,
		);
	}

	async resetPassword(token: string, newPassword: string) {
		const resetToken =
			await this.drizzle.db.query.passwordResetTokens.findFirst({
				where: {
					token,
					used: false,
				},
			});

		if (!resetToken) {
			throw new BadRequestException("Invalid or expired token");
		}

		if (new Date(resetToken.expiresAt) < new Date()) {
			throw new BadRequestException("Token has expired");
		}

		const password = await bcrypt.hash(newPassword, 10);

		await this.drizzle.db
			.update(users)
			.set({ password })
			.where(eq(users.id, resetToken.userId));

		await this.drizzle.db
			.update(passwordResetTokens)
			.set({ used: true })
			.where(eq(passwordResetTokens.id, resetToken.id));

		await this.drizzle.db
			.update(userSessions)
			.set({
				logoutAt: new Date().toISOString(),
			})
			.where(eq(userSessions.userId, resetToken.userId));
	}
}
