import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { passwordResetTokens, users } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "src/db/drizzle.service";
import { EmailService } from "src/email/email.service";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/users.types";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly emailService: EmailService,
		private readonly drizzle: DrizzleService,
		private jwtService: JwtService,
	) {}

	async validateUser(email: string, pass: string) {
		try {
			const user = await this.usersService.findOneByEmail(email);
			if (!(await bcrypt.compare(pass, user.password))) {
				return null;
			}

			const { password, ...result } = user;
			return result;
		} catch {
			return null;
		}
	}

	async login(user: Omit<User, "password">) {
		const authUser = await this.usersService.findUserWithPermissions(user.id);
		if (!authUser) {
			throw new UnauthorizedException();
		}

		const payload = {
			sub: authUser.id,
			username: authUser.email,
			permissions: authUser.permissions,
			role: authUser.role,
		};

		const access_token = await this.jwtService.signAsync(payload);
		return { access_token };
	}

	async forgotPassword(email: string, redirectUrl: string) {
		const user = await this.usersService.findOneByEmail(email);
		if (!user) return;

		const token = crypto.randomUUID();
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 1);

		await this.drizzle.db.insert(passwordResetTokens).values({
			userId: user.id,
			token,
			expiresAt: expiresAt.toISOString(),
			used: false,
		});

		const resetLink = `${redirectUrl}?token=${token}`;
		await this.emailService.sendResetPasswordEmail(user.email, resetLink);
	}

	async resetPassword(token: string, newPassword: string) {
		const resetToken =
			await this.drizzle.db.query.passwordResetTokens.findFirst({
				where: { token, used: false },
				with: { user: true },
			});

		if (!resetToken) {
			throw new BadRequestException("Invalid or expired token");
		}

		if (new Date(resetToken.expiresAt) < new Date()) {
			throw new BadRequestException("Token has expired");
		}

		const hashed = await bcrypt.hash(newPassword, 10);
		await this.drizzle.db
			.update(users)
			.set({ password: hashed })
			.where(eq(users.id, resetToken.userId));

		await this.drizzle.db
			.update(passwordResetTokens)
			.set({ used: true })
			.where(eq(passwordResetTokens.id, resetToken.id));
	}
}
