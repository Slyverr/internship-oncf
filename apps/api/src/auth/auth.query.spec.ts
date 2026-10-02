import { passwordResetTokens, userSessions, users } from "drizzle/schema";
import { AuthQuery } from "./auth.query";

const userId = 7 as never;

describe("AuthQuery", () => {
	it("creates a session with its user and expiry", async () => {
		const values = jest.fn().mockResolvedValue(undefined);
		const insert = jest.fn().mockReturnValue({ values });
		const query = new AuthQuery({ db: { insert } } as never);

		await query.createSession(userId, "session-token", "2030-01-01T00:00:00Z");

		expect(insert).toHaveBeenCalledWith(userSessions);
		expect(values).toHaveBeenCalledWith({
			userId,
			sessionToken: "session-token",
			expiredAt: "2030-01-01T00:00:00Z",
		});
	});

	it("finds a session scoped to both token and user", async () => {
		const session = { id: 3 };
		const findFirst = jest.fn().mockResolvedValue(session);
		const query = new AuthQuery({
			db: { query: { userSessions: { findFirst } } },
		} as never);

		await expect(query.findSession("session-token", userId)).resolves.toBe(
			session,
		);
		expect(findFirst).toHaveBeenCalledWith({
			where: { sessionToken: "session-token", userId },
		});
	});

	it("marks a logged-out session without changing another session", async () => {
		const where = jest.fn().mockResolvedValue(undefined);
		const set = jest.fn().mockReturnValue({ where });
		const update = jest.fn().mockReturnValue({ set });
		const query = new AuthQuery({ db: { update } } as never);

		await query.logoutSession("session-token");

		expect(update).toHaveBeenCalledWith(userSessions);
		expect(set).toHaveBeenCalledWith({ logoutAt: expect.any(String) });
		expect(where).toHaveBeenCalledWith(expect.anything());
	});

	it("updates a password and revokes all sessions atomically", async () => {
		const set = jest.fn().mockReturnValue({
			where: jest.fn().mockResolvedValue(undefined),
		});
		const update = jest.fn().mockReturnValue({ set });
		const tx = { update };
		const transaction = jest.fn((run) => run(tx));
		const query = new AuthQuery({ db: { transaction } } as never);

		await query.updatePasswordAndRevokeSessions(userId, "hashed-password");

		expect(transaction).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenNthCalledWith(1, users);
		expect(set).toHaveBeenNthCalledWith(1, { password: "hashed-password" });
		expect(update).toHaveBeenNthCalledWith(2, userSessions);
		expect(set).toHaveBeenNthCalledWith(2, { logoutAt: expect.any(String) });
	});

	it("looks up only the id and email for password-reset requests", async () => {
		const user = { id: userId, email: "person@example.test" };
		const findFirst = jest.fn().mockResolvedValue(user);
		const query = new AuthQuery({
			db: { query: { users: { findFirst } } },
		} as never);

		await expect(query.findUserByEmail(user.email)).resolves.toBe(user);
		expect(findFirst).toHaveBeenCalledWith({
			where: { email: user.email },
			columns: { id: true, email: true },
		});
	});

	it("creates an unused password-reset token", async () => {
		const values = jest.fn().mockResolvedValue(undefined);
		const insert = jest.fn().mockReturnValue({ values });
		const query = new AuthQuery({ db: { insert } } as never);

		await query.createPasswordResetToken(
			userId,
			"reset-token",
			"2030-01-01T00:00:00Z",
		);

		expect(insert).toHaveBeenCalledWith(passwordResetTokens);
		expect(values).toHaveBeenCalledWith({
			userId,
			token: "reset-token",
			expiresAt: "2030-01-01T00:00:00Z",
			used: false,
		});
	});

	it("finds a password-reset token by token value", async () => {
		const resetToken = { id: 4 };
		const findFirst = jest.fn().mockResolvedValue(resetToken);
		const query = new AuthQuery({
			db: { query: { passwordResetTokens: { findFirst } } },
		} as never);

		await expect(query.findPasswordResetToken("reset-token")).resolves.toBe(
			resetToken,
		);
		expect(findFirst).toHaveBeenCalledWith({ where: { token: "reset-token" } });
	});

	it.each([
		["missing", undefined],
		["already used", { id: 4, used: true, expiresAt: "2099-01-01T00:00:00Z" }],
	])(
		"does not reset a password when the token is %s",
		async (_label, token) => {
			const findFirst = jest.fn().mockResolvedValue(token);
			const update = jest.fn();
			const transaction = jest.fn((run) =>
				run({ query: { passwordResetTokens: { findFirst } }, update }),
			);
			const query = new AuthQuery({ db: { transaction } } as never);

			await expect(
				query.resetPassword("reset-token", "new-password"),
			).resolves.toBe("invalid");
			expect(update).not.toHaveBeenCalled();
		},
	);

	it("returns expired without consuming an expired token", async () => {
		const findFirst = jest.fn().mockResolvedValue({
			id: 4,
			userId,
			used: false,
			expiresAt: "2000-01-01T00:00:00Z",
		});
		const update = jest.fn();
		const transaction = jest.fn((run) =>
			run({ query: { passwordResetTokens: { findFirst } }, update }),
		);
		const query = new AuthQuery({ db: { transaction } } as never);

		await expect(
			query.resetPassword("reset-token", "new-password"),
		).resolves.toBe("expired");
		expect(update).not.toHaveBeenCalled();
	});

	it("rejects a token consumed concurrently by another reset", async () => {
		const findFirst = jest
			.fn()
			.mockResolvedValueOnce({
				id: 4,
				userId,
				used: false,
				expiresAt: "2099-01-01T00:00:00Z",
			})
			.mockResolvedValueOnce({
				id: 4,
				userId,
				used: true,
				expiresAt: "2099-01-01T00:00:00Z",
			});
		const returning = jest.fn().mockResolvedValue([]);
		const where = jest.fn().mockReturnValue({ returning });
		const set = jest.fn().mockReturnValue({ where });
		const update = jest.fn().mockReturnValue({ set });
		const transaction = jest.fn((run) =>
			run({ query: { passwordResetTokens: { findFirst } }, update }),
		);
		const query = new AuthQuery({ db: { transaction } } as never);

		await expect(
			query.resetPassword("reset-token", "new-password"),
		).resolves.toBe("invalid");
		expect(update).toHaveBeenCalledWith(passwordResetTokens);
		expect(set).toHaveBeenCalledWith({ used: true });
		expect(update).toHaveBeenCalledTimes(1);
	});

	it.each([
		[
			"expired concurrently",
			{ id: 4, used: false, expiresAt: "2000-01-01T00:00:00Z" },
			"expired",
		],
		["removed concurrently", undefined, "invalid"],
	] as const)(
		"reports a token that was %s during consumption",
		async (_state, currentToken, expected) => {
			const findFirst = jest
				.fn()
				.mockResolvedValueOnce({
					id: 4,
					userId,
					used: false,
					expiresAt: "2099-01-01T00:00:00Z",
				})
				.mockResolvedValueOnce(currentToken);
			const returning = jest.fn().mockResolvedValue([]);
			const where = jest.fn().mockReturnValue({ returning });
			const update = jest.fn().mockReturnValue({
				set: jest.fn().mockReturnValue({ where }),
			});
			const transaction = jest.fn((run) =>
				run({ query: { passwordResetTokens: { findFirst } }, update }),
			);
			const query = new AuthQuery({ db: { transaction } } as never);

			await expect(
				query.resetPassword("reset-token", "new-password"),
			).resolves.toBe(expected);
			expect(findFirst).toHaveBeenCalledTimes(2);
		},
	);

	it("updates the password and revokes sessions after consuming a valid token", async () => {
		const resetToken = {
			id: 4,
			userId,
			used: false,
			expiresAt: "2099-01-01T00:00:00Z",
		};
		const findFirst = jest.fn().mockResolvedValue(resetToken);
		const returning = jest.fn().mockResolvedValue([{ userId }]);
		const where = jest.fn().mockReturnValue({ returning });
		const resetSet = jest.fn().mockReturnValue({ where });
		const userSet = jest.fn().mockReturnValue({ where: jest.fn() });
		const sessionsSet = jest.fn().mockReturnValue({ where: jest.fn() });
		const update = jest
			.fn()
			.mockReturnValueOnce({ set: resetSet })
			.mockReturnValueOnce({ set: userSet })
			.mockReturnValueOnce({ set: sessionsSet });
		const transaction = jest.fn((run) =>
			run({ query: { passwordResetTokens: { findFirst } }, update }),
		);
		const query = new AuthQuery({ db: { transaction } } as never);

		await expect(
			query.resetPassword("reset-token", "hashed-password"),
		).resolves.toBe("success");
		expect(transaction).toHaveBeenCalledTimes(1);
		expect(update).toHaveBeenNthCalledWith(1, passwordResetTokens);
		expect(resetSet).toHaveBeenCalledWith({ used: true });
		expect(update).toHaveBeenNthCalledWith(2, users);
		expect(userSet).toHaveBeenCalledWith({ password: "hashed-password" });
		expect(update).toHaveBeenNthCalledWith(3, userSessions);
		expect(sessionsSet).toHaveBeenCalledWith({ logoutAt: expect.any(String) });
	});
});
