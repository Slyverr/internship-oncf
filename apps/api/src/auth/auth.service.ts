import crypto from "node:crypto";
import { API_ERROR_CODES, RegistrationStatus } from "@ecommand/shared";
import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { CustomersService } from "@/customers/customers.service";
import { EmailService } from "@/email/email.service";
import { UsersService } from "@/users/users.service";
import { User } from "@/users/users.types";
import { AuthQuery } from "./auth.query";
import { AuthUser } from "./auth.types";
import { ChangePasswordDto } from "./requests/change-password.dto";
import { RegisterClientDto } from "./requests/register-client.dto";

export interface JwtPayload {
	sub: number;
	sid: string;
}

const DUMMY_PASSWORD_HASH =
	"$2b$10$sZOhHN3cM.EAyYArL1vqRO7PNE2k9S5ff9VYMijvkDYIlGTa6WweW";
const DEFAULT_LOGIN_MAX_ATTEMPTS = 5;
const DEFAULT_LOGIN_LOCK_DURATION_SECONDS = 15 * 60;

function positiveConfigInteger(
	config: ConfigService,
	key: string,
	fallback: number,
	maximum: number,
) {
	const value = Number(config.get<string | number>(key));
	return Number.isSafeInteger(value) && value >= 1 && value <= maximum
		? value
		: fallback;
}

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly emailService: EmailService,
		private readonly authQuery: AuthQuery,
		private readonly jwtService: JwtService,
		private readonly config: ConfigService,
		private readonly customersService: CustomersService,
	) {}

	async validateUser(identifier: string, password: string) {
		const user = await this.usersService.findOneByLoginIdentifier(
			identifier.trim(),
		);
		if (!user) {
			await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
			return null;
		}

		const passwordMatches = await bcrypt.compare(
			password,
			user.password ?? DUMMY_PASSWORD_HASH,
		);

		if (
			!user.isActive ||
			user.registrationStatus !== RegistrationStatus.APPROVED
		)
			return null;

		if (
			user.accountLockedUntil &&
			new Date(user.accountLockedUntil) > new Date()
		) {
			throw new UnauthorizedException({
				code: API_ERROR_CODES.AUTH_ACCOUNT_LOCKED,
			});
		}

		if (!passwordMatches) {
			const failedAttempt = await this.authQuery.recordFailedLoginAttempt(
				user.id,
				positiveConfigInteger(
					this.config,
					"AUTH_LOGIN_MAX_ATTEMPTS",
					DEFAULT_LOGIN_MAX_ATTEMPTS,
					100,
				),
				positiveConfigInteger(
					this.config,
					"AUTH_LOGIN_LOCK_DURATION_SECONDS",
					DEFAULT_LOGIN_LOCK_DURATION_SECONDS,
					7 * 24 * 60 * 60,
				),
			);
			if (
				failedAttempt?.accountLockedUntil &&
				new Date(failedAttempt.accountLockedUntil) > new Date()
			) {
				throw new UnauthorizedException({
					code: API_ERROR_CODES.AUTH_ACCOUNT_LOCKED,
				});
			}
			return null;
		}

		const { password: _, ...safeUser } = user;
		return safeUser;
	}

	async register(dto: RegisterClientDto) {
		const customer =
			await this.customersService.findActiveCustomerForRegistration(
				dto.customerCode,
				dto.ice,
			);
		if (!customer) {
			throw new BadRequestException({
				code: API_ERROR_CODES.CUSTOMER_IDENTITY_INVALID,
			});
		}

		return this.usersService.registerClient({
			email: dto.email,
			password: dto.password,
			firstName: dto.firstName,
			lastName: dto.lastName,
			customerId: customer.id,
		});
	}

	async login(user: Omit<User, "password">) {
		await this.authQuery.resetFailedLoginAttempts(user.id);
		const sessionId = crypto.randomUUID();

		const accessToken = await this.jwtService.signAsync({
			sub: user.id,
			sid: sessionId,
		});

		const payload = this.jwtService.decode(accessToken) as {
			exp: number;
		};

		await this.authQuery.createSession(
			user.id,
			sessionId,
			new Date(payload.exp * 1000).toISOString(),
		);

		return {
			access_token: accessToken,
		};
	}

	async validateSession(userId: number, sessionId: string): Promise<AuthUser> {
		const session = await this.authQuery.findSession(sessionId, userId);

		if (
			!session ||
			session.logoutAt ||
			new Date(session.expiredAt) <= new Date()
		) {
			throw new UnauthorizedException({
				code: API_ERROR_CODES.AUTHENTICATION_REQUIRED,
			});
		}

		const user = await this.usersService.findOneForAuth(userId);

		if (
			!user.isActive ||
			user.registrationStatus !== RegistrationStatus.APPROVED
		) {
			throw new UnauthorizedException({
				code: API_ERROR_CODES.AUTHENTICATION_REQUIRED,
			});
		}

		return {
			id: user.id,
			email: user.email,
			role: user.role,
			persona: user.persona,
			permissions: new Set(user.permissions),
			sessionId,
			customerId: user.customerId,
			agencyId: user.agencyId,
			assignedCustomerIds: user.assignedCustomerIds,
		};
	}

	async logout(user: AuthUser) {
		await this.authQuery.logoutSession(user.sessionId);
	}

	async changePassword(id: number, dto: ChangePasswordDto) {
		const user = await this.usersService.findOneForAuth(id);

		if (!(await bcrypt.compare(dto.currentPassword, user.password))) {
			throw new BadRequestException({
				code: API_ERROR_CODES.CURRENT_PASSWORD_INVALID,
			});
		}

		const password = await bcrypt.hash(dto.newPassword, 10);

		await this.authQuery.updatePasswordAndRevokeSessions(id, password);
	}

	async forgotPassword(email: string) {
		const user = await this.authQuery.findUserByEmail(email);

		if (!user) {
			return;
		}

		const token = crypto.randomBytes(32).toString("base64url");
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 1);

		await this.authQuery.createPasswordResetToken(
			user.id,
			token,
			expiresAt.toISOString(),
		);

		await this.emailService.sendResetPasswordEmail(
			user.email,
			`${this.config.get("WEB_APP_URL", "http://localhost:3000")}/reset-password?token=${encodeURIComponent(token)}`,
		);
	}

	async resetPassword(token: string, newPassword: string) {
		const resetToken = await this.authQuery.findPasswordResetToken(token);

		if (!resetToken || resetToken.used) {
			throw new BadRequestException({
				code: API_ERROR_CODES.RESET_TOKEN_INVALID,
			});
		}

		if (new Date(resetToken.expiresAt) < new Date()) {
			throw new BadRequestException({
				code: API_ERROR_CODES.RESET_TOKEN_EXPIRED,
			});
		}

		const password = await bcrypt.hash(newPassword, 10);
		const resetResult = await this.authQuery.resetPassword(token, password);

		if (resetResult === "expired") {
			throw new BadRequestException({
				code: API_ERROR_CODES.RESET_TOKEN_EXPIRED,
			});
		}
		if (resetResult !== "success") {
			throw new BadRequestException({
				code: API_ERROR_CODES.RESET_TOKEN_INVALID,
			});
		}
	}
}
