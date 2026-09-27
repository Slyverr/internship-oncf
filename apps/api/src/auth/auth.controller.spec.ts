import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { IS_PUBLIC_KEY } from "./public.decorator";

describe("AuthController", () => {
	const authService = {
		login: jest.fn(),
		register: jest.fn(),
		changePassword: jest.fn(),
		logout: jest.fn(),
		forgotPassword: jest.fn(),
		resetPassword: jest.fn(),
	};
	const controller = new AuthController(authService as unknown as AuthService);

	beforeEach(() => {
		for (const mock of Object.values(authService)) mock.mockReset();
	});

	it("passes the authenticated user to login", async () => {
		const user = { id: 8 } as never;
		await controller.login({ user }, {} as never);
		expect(authService.login).toHaveBeenCalledWith(user);
	});

	it("exposes registration publicly and delegates the submitted customer details", async () => {
		const dto = {
			email: "client@example.test",
			customerCode: "CLI009",
			ice: "123456789012345",
		} as never;
		authService.register.mockResolvedValue({
			message: "Registration submitted for admin review.",
		});

		expect(
			Reflect.getMetadata(IS_PUBLIC_KEY, AuthController.prototype.register),
		).toBe(true);
		await expect(controller.register(dto)).resolves.toEqual({
			message: "Registration submitted for admin review.",
		});
		expect(authService.register).toHaveBeenCalledWith(dto);
	});

	it("changes the authenticated user password and returns a success message", async () => {
		const dto = { currentPassword: "old", newPassword: "new" } as never;
		await expect(
			controller.changePassword(dto, { user: { id: 8 } } as never),
		).resolves.toEqual({ message: "Password changed successfully" });
		expect(authService.changePassword).toHaveBeenCalledWith(8, dto);
	});

	it("logs out the current session", async () => {
		const user = { id: 8, sessionId: "session" } as never;
		await expect(controller.logout({ user } as never)).resolves.toEqual({
			message: "Logged out successfully",
		});
		expect(authService.logout).toHaveBeenCalledWith(user);
	});

	it("keeps forgot-password responses account-neutral", async () => {
		await expect(
			controller.forgotPassword({ email: "a@example.test" } as never),
		).resolves.toEqual({
			message:
				"If an account exists with this email, a reset link has been sent.",
		});
		expect(authService.forgotPassword).toHaveBeenCalledWith("a@example.test");
	});

	it("passes reset token and replacement password to the service", async () => {
		await expect(
			controller.resetPassword({ token: "token", newPassword: "new" } as never),
		).resolves.toEqual({ message: "Password has been reset successfully" });
		expect(authService.resetPassword).toHaveBeenCalledWith("token", "new");
	});
});
