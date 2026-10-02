import { HttpException, HttpStatus } from "@nestjs/common";
import { ConstraintCode } from "./constraints";
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
});
