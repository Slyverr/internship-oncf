import { API_RESPONSE_CODES } from "@ecommand/shared";
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
			code: API_RESPONSE_CODES.REGISTRATION_SUBMITTED_FOR_REVIEW,
		});

		expect(
			Reflect.getMetadata(IS_PUBLIC_KEY, AuthController.prototype.register),
		).toBe(true);
		await expect(controller.register(dto)).resolves.toEqual({
			code: API_RESPONSE_CODES.REGISTRATION_SUBMITTED_FOR_REVIEW,
		});
		expect(authService.register).toHaveBeenCalledWith(dto);
	});

	it("changes the authenticated user password and returns a success code", async () => {
		const dto = { currentPassword: "old", newPassword: "new" } as never;
		await expect(
			controller.changePassword(dto, { user: { id: 8 } } as never),
		).resolves.toEqual({ code: API_RESPONSE_CODES.AUTH_PASSWORD_CHANGED });
		expect(authService.changePassword).toHaveBeenCalledWith(8, dto);
	});

	it("logs out the current session", async () => {
		const user = { id: 8, sessionId: "session" } as never;
		await expect(controller.logout({ user } as never)).resolves.toEqual({
			code: API_RESPONSE_CODES.AUTH_LOGGED_OUT,
		});
		expect(authService.logout).toHaveBeenCalledWith(user);
	});

	it("keeps forgot-password responses account-neutral", async () => {
		await expect(
			controller.forgotPassword({ email: "a@example.test" } as never),
		).resolves.toEqual({
			code: API_RESPONSE_CODES.AUTH_PASSWORD_RESET_REQUEST_ACCEPTED,
		});
		expect(authService.forgotPassword).toHaveBeenCalledWith("a@example.test");
	});

	it("passes reset token and replacement password to the service", async () => {
		await expect(
			controller.resetPassword({ token: "token", newPassword: "new" } as never),
		).resolves.toEqual({ code: API_RESPONSE_CODES.AUTH_PASSWORD_RESET });
		expect(authService.resetPassword).toHaveBeenCalledWith("token", "new");
	});
});
