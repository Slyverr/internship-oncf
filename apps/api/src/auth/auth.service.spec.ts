import { Permission, RegistrationStatus, Role } from "@ecommand/shared";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { CustomersService } from "@/customers/customers.service";
import { EmailService } from "@/email/email.service";
import { UsersService } from "@/users/users.service";
import { AuthQuery } from "./auth.query";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
	let service: AuthService;
	let users: {
		findOneByLoginIdentifier: jest.Mock;
		findOneForAuth: jest.Mock;
		registerClient: jest.Mock;
	};
	let query: Record<string, jest.Mock>;
	let email: { sendResetPasswordEmail: jest.Mock };
	let jwt: { signAsync: jest.Mock; decode: jest.Mock };
	let config: { get: jest.Mock };
	let customers: { findActiveCustomerForRegistration: jest.Mock };

	beforeEach(() => {
		users = {
			findOneByLoginIdentifier: jest.fn(),
			findOneForAuth: jest.fn(),
			registerClient: jest.fn(),
		};
		customers = { findActiveCustomerForRegistration: jest.fn() };
		query = {
			createSession: jest.fn(),
			findSession: jest.fn(),
			logoutSession: jest.fn(),
			updateUserPassword: jest.fn(),
			revokeAllUserSessions: jest.fn(),
			findUserByEmail: jest.fn(),
			createPasswordResetToken: jest.fn(),
			findValidResetToken: jest.fn(),
			markResetTokenAsUsed: jest.fn(),
		};
		email = { sendResetPasswordEmail: jest.fn() };
		jwt = {
			signAsync: jest.fn().mockResolvedValue("signed-token"),
			decode: jest.fn().mockReturnValue({ exp: 2_000_000_000 }),
		};
		config = { get: jest.fn((_key, fallback) => fallback) };
		service = new AuthService(
			users as unknown as UsersService,
			email as unknown as EmailService,
			query as unknown as AuthQuery,
			jwt as unknown as JwtService,
			config as unknown as ConfigService,
			customers as unknown as CustomersService,
		);
	});

	it("rejects inactive and currently locked accounts before checking passwords", async () => {
		users.findOneByLoginIdentifier.mockResolvedValue({ isActive: false });
		expect(
			await service.validateUser("agent@example.test", "secret"),
		).toBeNull();
		users.findOneByLoginIdentifier.mockResolvedValue({
			isActive: true,
			registrationStatus: RegistrationStatus.APPROVED,
			accountLockedUntil: new Date(Date.now() + 60_000).toISOString(),
		});
		expect(
			await service.validateUser("agent@example.test", "secret"),
		).toBeNull();
	});

	it("returns null for a wrong password and omits the stored hash on success", async () => {
		const password = await bcrypt.hash("correct horse battery staple", 4);
		users.findOneByLoginIdentifier.mockResolvedValue({
			id: 7,
			email: "agent@example.test",
			password,
			isActive: true,
			registrationStatus: RegistrationStatus.APPROVED,
		});
		expect(
			await service.validateUser("agent@example.test", "wrong password"),
		).toBeNull();
		const result = await service.validateUser(
			"agent@example.test",
			"correct horse battery staple",
		);
		expect(result).toMatchObject({ id: 7, email: "agent@example.test" });
		expect(result).not.toHaveProperty("password");
	});

	it("uses a trimmed email or employee identifier for account lookup", async () => {
		users.findOneByLoginIdentifier.mockResolvedValue(undefined);
		expect(await service.validateUser(" EMP-12 ", "secret")).toBeNull();
		expect(users.findOneByLoginIdentifier).toHaveBeenCalledWith("EMP-12");
	});

	it("rejects pending or rejected accounts even if they are active", async () => {
		for (const registrationStatus of [
			RegistrationStatus.PENDING,
			RegistrationStatus.REJECTED,
		]) {
			users.findOneByLoginIdentifier.mockResolvedValue({
				isActive: true,
				registrationStatus,
			});
			expect(
				await service.validateUser("client@example.test", "password"),
			).toBeNull();
		}
	});

	it("verifies customer code and ICE before submitting registration", async () => {
		customers.findActiveCustomerForRegistration.mockResolvedValue({ id: 31 });
		users.registerClient.mockResolvedValue({
			message: "Registration submitted for admin review.",
		});
		const dto = {
			email: "client@example.test",
			password: "StrongPass1!",
			firstName: "Sam",
			lastName: "Example",
			customerCode: "CLI009",
			ice: "123456789012345",
		} as never;

		await expect(service.register(dto)).resolves.toEqual({
			message: "Registration submitted for admin review.",
		});
		expect(customers.findActiveCustomerForRegistration).toHaveBeenCalledWith(
			"CLI009",
			"123456789012345",
		);
		expect(users.registerClient).toHaveBeenCalledWith({
			email: "client@example.test",
			password: "StrongPass1!",
			firstName: "Sam",
			lastName: "Example",
			customerId: 31,
		});
	});

	it("does not create an account when customer identifiers do not match", async () => {
		customers.findActiveCustomerForRegistration.mockResolvedValue(undefined);
		await expect(
			service.register({
				customerCode: "CLI009",
				ice: "000000000000000",
			} as never),
		).rejects.toBeInstanceOf(BadRequestException);
		expect(users.registerClient).not.toHaveBeenCalled();
	});

	it("creates a persisted session when logging in", async () => {
		const result = await service.login({ id: 7 } as never);
		expect(result).toEqual({ access_token: "signed-token" });
		expect(jwt.signAsync).toHaveBeenCalledWith(
			expect.objectContaining({ sub: 7, sid: expect.any(String) }),
		);
		expect(query.createSession).toHaveBeenCalledWith(
			7,
			expect.any(String),
			new Date(2_000_000_000_000).toISOString(),
		);
	});

	it.each([
		["missing", undefined],
		[
			"logged out",
			{
				logoutAt: new Date().toISOString(),
				expiredAt: new Date(Date.now() + 60_000).toISOString(),
			},
		],
		[
			"expired",
			{
				logoutAt: null,
				expiredAt: new Date(Date.now() - 60_000).toISOString(),
			},
		],
	])("rejects a %s session", async (_label, session) => {
		query.findSession.mockResolvedValue(session);
		await expect(
			service.validateSession(7, "session-id"),
		).rejects.toBeInstanceOf(UnauthorizedException);
		expect(users.findOneForAuth).not.toHaveBeenCalled();
	});

	it("rejects sessions for users who have been deactivated", async () => {
		query.findSession.mockResolvedValue({
			logoutAt: null,
			expiredAt: new Date(Date.now() + 60_000).toISOString(),
		});
		users.findOneForAuth.mockResolvedValue({ isActive: false });
		await expect(
			service.validateSession(7, "session-id"),
		).rejects.toBeInstanceOf(UnauthorizedException);
	});

	it("returns current identity and effective permissions for a valid session", async () => {
		query.findSession.mockResolvedValue({
			logoutAt: null,
			expiredAt: new Date(Date.now() + 60_000).toISOString(),
		});
		users.findOneForAuth.mockResolvedValue({
			id: 7,
			email: "agent@example.test",
			isActive: true,
			registrationStatus: RegistrationStatus.APPROVED,
			role: Role.AGENT_COMMERCIAL,
			permissions: [Permission.ORDERS_READ],
			customerId: null,
			agencyId: 4,
		});
		const result = await service.validateSession(7, "session-id");
		expect(result).toMatchObject({
			id: 7,
			email: "agent@example.test",
			role: Role.AGENT_COMMERCIAL,
			sessionId: "session-id",
			agencyId: 4,
		});
		expect(result.permissions).toEqual(new Set([Permission.ORDERS_READ]));
	});

	it("rejects a pending user session even if an account was accidentally activated", async () => {
		query.findSession.mockResolvedValue({
			logoutAt: null,
			expiredAt: new Date(Date.now() + 60_000).toISOString(),
		});
		users.findOneForAuth.mockResolvedValue({
			isActive: true,
			registrationStatus: RegistrationStatus.PENDING,
		});
		await expect(
			service.validateSession(7, "session-id"),
		).rejects.toBeInstanceOf(UnauthorizedException);
	});

	it("revokes every session after a successful password change", async () => {
		users.findOneForAuth.mockResolvedValue({
			password: await bcrypt.hash("old password", 4),
		});
		await service.changePassword(7, {
			currentPassword: "old password",
			newPassword: "new password",
		} as never);
		expect(query.updateUserPassword).toHaveBeenCalledWith(
			7,
			expect.any(String),
		);
		expect(query.revokeAllUserSessions).toHaveBeenCalledWith(7);
	});

	it("does not update credentials when the current password is wrong", async () => {
		users.findOneForAuth.mockResolvedValue({
			password: await bcrypt.hash("old password", 4),
		});
		await expect(
			service.changePassword(7, {
				currentPassword: "incorrect",
				newPassword: "new password",
			} as never),
		).rejects.toBeInstanceOf(BadRequestException);
		expect(query.updateUserPassword).not.toHaveBeenCalled();
		expect(query.revokeAllUserSessions).not.toHaveBeenCalled();
	});

	it("keeps forgot-password responses neutral for unknown email addresses", async () => {
		query.findUserByEmail.mockResolvedValue(undefined);
		await service.forgotPassword("missing@example.test");
		expect(query.createPasswordResetToken).not.toHaveBeenCalled();
		expect(email.sendResetPasswordEmail).not.toHaveBeenCalled();
	});

	it("creates a one-hour reset token and sends a local-default reset link", async () => {
		query.findUserByEmail.mockResolvedValue({
			id: 7,
			email: "agent@example.test",
		});
		await service.forgotPassword("agent@example.test");
		const [userId, token, expiresAt] =
			query.createPasswordResetToken.mock.calls[0];
		expect(userId).toBe(7);
		expect(token).toEqual(expect.any(String));
		expect(new Date(expiresAt).getTime()).toBeGreaterThan(
			Date.now() + 59 * 60_000,
		);
		expect(email.sendResetPasswordEmail).toHaveBeenCalledWith(
			"agent@example.test",
			expect.stringContaining(
				"http://localhost:3000/reset-password?token=" +
					encodeURIComponent(token),
			),
		);
	});

	it("rejects missing and expired reset tokens without changing the password", async () => {
		query.findValidResetToken.mockResolvedValue(undefined);
		await expect(
			service.resetPassword("invalid", "new password"),
		).rejects.toBeInstanceOf(BadRequestException);
		query.findValidResetToken.mockResolvedValue({
			id: 8,
			userId: 7,
			expiresAt: new Date(Date.now() - 60_000).toISOString(),
		});
		await expect(
			service.resetPassword("expired", "new password"),
		).rejects.toThrow("Token has expired");
		expect(query.updateUserPassword).not.toHaveBeenCalled();
	});

	it("marks a valid reset token as used and revokes existing sessions", async () => {
		query.findValidResetToken.mockResolvedValue({
			id: 8,
			userId: 7,
			expiresAt: new Date(Date.now() + 60_000).toISOString(),
		});
		await service.resetPassword("valid", "new password");
		expect(query.updateUserPassword).toHaveBeenCalledWith(
			7,
			expect.any(String),
		);
		expect(query.markResetTokenAsUsed).toHaveBeenCalledWith(8);
		expect(query.revokeAllUserSessions).toHaveBeenCalledWith(7);
	});
});
