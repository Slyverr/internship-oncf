import { HttpException, HttpStatus } from "@nestjs/common";
import { ConstraintCode, constraintHandlers } from "./constraints";
import { withDbErrorHandling } from "./drizzle.util";

describe("withDbErrorHandling", () => {
	it("returns a stable code and status without English response text", async () => {
		const operation = jest.fn().mockRejectedValue({
			cause: { constraint: "users_email_key" },
		});

		const error = await withDbErrorHandling(operation, {
			email: "taken@example.test",
		}).catch((caught: unknown) => caught);

		expect(error).toMatchObject({
			response: { code: ConstraintCode.DUPLICATE_USER_EMAIL },
			status: HttpStatus.CONFLICT,
		});
		if (error instanceof HttpException) {
			expect(error.getResponse()).toEqual({
				code: ConstraintCode.DUPLICATE_USER_EMAIL,
			});
		}
	});

	it("maps every registered constraint to a stable code and status", async () => {
		for (const [constraint, handler] of Object.entries(constraintHandlers)) {
			const expected = handler({});
			const error = await withDbErrorHandling(
				() => Promise.reject({ cause: { constraint } }),
				{},
			).catch((caught: unknown) => caught);

			expect(error).toBeInstanceOf(HttpException);
			if (!(error instanceof HttpException)) continue;

			expect(error.getStatus()).toBe(expected.statusCode);
			expect(error.getResponse()).toEqual({ code: expected.code });
			expect(Object.values(ConstraintCode)).toContain(expected.code);
			expect(expected.statusCode).toBe(
				constraint.endsWith("_fkey")
					? HttpStatus.UNPROCESSABLE_ENTITY
					: HttpStatus.CONFLICT,
			);
		}
	});

	it("rethrows unregistered database errors unchanged", async () => {
		const error = new Error("database details must remain internal");
		await expect(
			withDbErrorHandling(() => Promise.reject(error), {}),
		).rejects.toBe(error);
	});

	it("returns successful database results unchanged", async () => {
		const result = { id: 1 };
		await expect(
			withDbErrorHandling(() => Promise.resolve(result), {}),
		).resolves.toBe(result);
	});
});
