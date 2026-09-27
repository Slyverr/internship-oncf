import { Permission } from "@ecommand/shared";
import type { AuthUser } from "@/auth/auth.types";
import { ProgramsQuery } from "./programs.query";

const createUser = (
	id: number,
	permissions: Permission[] = [],
	customerId: number | null = null,
) => ({ id, permissions: new Set(permissions), customerId }) as AuthUser;

describe("ProgramsQuery authorization scope", () => {
	const findMany = jest.fn();
	const query = new ProgramsQuery({
		db: { query: { forecastPrograms: { findMany } } },
	} as never);
	beforeEach(() => {
		findMany.mockReset().mockResolvedValue([]);
	});

	it("forces ordinary users to their own programs despite a requested user filter", async () => {
		const user = createUser(18);
		await query.findPrograms(user, {
			page: 2,
			limit: 5,
			userId: 91,
			search: "FP-",
			status: "APPROVED",
		} as never);
		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					createdByUserId: user.id,
					programStatus: { name: "APPROVED" },
					programNumber: { ilike: "%FP-%" },
				},
				limit: 5,
				offset: 5,
			}),
		);
	});

	it("allows managers to filter by a selected creator", async () => {
		const user = createUser(18, [Permission.PROGRAMS_MANAGE_OTHER]);
		await query.findPrograms(user, { page: 1, limit: 10, userId: 91 } as never);
		expect(findMany.mock.calls[0][0].where).toEqual({ createdByUserId: 91 });
	});

	it("allows managers to list all creators when no creator filter is selected", async () => {
		const user = createUser(18, [Permission.PROGRAMS_MANAGE_OTHER]);
		await query.findPrograms(user, { page: 1, limit: 10 } as never);
		expect(findMany.mock.calls[0][0].where).toEqual({});
	});

	it("scopes customer-assigned users to programs linked to their customer", async () => {
		const user = createUser(18, [], 42);
		await query.findPrograms(user, {
			page: 1,
			limit: 10,
			userId: 91,
		} as never);

		expect(findMany.mock.calls[0][0].where).toEqual({
			order: { customerId: 42 },
		});
	});
});
