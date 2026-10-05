import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "../../drizzle/schemas/users";

describe("Drizzle updatedAt behavior", () => {
	it("adds an updatedAt value to updates that omit it", () => {
		const query = drizzle
			.mock()
			.update(users)
			.set({ firstName: "Updated" })
			.where(eq(users.id, 1))
			.toSQL();

		expect(query.sql).toContain('"updated_at" = $2');
		expect(query.params[1]).toEqual(expect.any(String));
		expect(Date.parse(query.params[1] as string)).not.toBeNaN();
	});

	it("keeps an explicitly supplied updatedAt value", () => {
		const updatedAt = "2026-10-05T12:00:00.000Z";
		const query = drizzle
			.mock()
			.update(users)
			.set({ firstName: "Updated", updatedAt })
			.where(eq(users.id, 1))
			.toSQL();

		expect(query.params[1]).toBe(updatedAt);
	});
});
