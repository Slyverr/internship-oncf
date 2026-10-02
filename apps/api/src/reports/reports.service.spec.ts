import { API_ERROR_CODES, Permission, Role } from "@ecommand/shared";
import { PgDialect } from "drizzle-orm/pg-core";
import type { AuthUser } from "@/auth/auth.types";
import { ReportsService } from "./reports.service";

type QueryCapture = { where: unknown };

function queryBuilder(result: unknown, capture: QueryCapture) {
	const builder: Record<string, unknown> = {};
	for (const method of ["from", "innerJoin", "where", "groupBy", "orderBy"]) {
		builder[method] = jest.fn((...args: unknown[]) => {
			if (method === "where") capture.where = args[0];
			return builder;
		});
	}
	// biome-ignore lint/suspicious/noThenProperty: Drizzle query builders are thenable.
	builder.then = (
		resolve: (value: unknown) => unknown,
		reject: (reason: unknown) => unknown,
	) => Promise.resolve(result).then(resolve, reject);
	return builder;
}

function setup(results: unknown[]) {
	const captures: QueryCapture[] = [];
	const db = {
		select: jest.fn(() => {
			const capture: QueryCapture = { where: undefined };
			captures.push(capture);
			return queryBuilder(results.shift(), capture);
		}),
	};
	const service = new ReportsService({ db } as never);
	return { service, db, captures };
}

const user = (
	permissions: Permission[],
	customerId: number | null = null,
): AuthUser => ({
	id: 9,
	email: "client@example.test",
	role: Role.CLIENT_REPRESENTATIVE,
	permissions: new Set(permissions),
	sessionId: "session-1",
	customerId,
	agencyId: null,
});

describe("ReportsService", () => {
	it("returns report totals and breakdowns with null date bounds by default", async () => {
		const results = [
			[{ count: 4 }],
			[{ id: 1, name: "SUBMITTED", count: 2 }],
			[{ id: 2, name: "North Customer", count: 4 }],
			[{ id: 3, name: "Steel", count: 4 }],
			[{ month: "2025-03", count: 4 }],
		];
		const { service, db } = setup(results);

		expect(
			await service.getOrders(user([Permission.ORDERS_MANAGE_OTHER]), {}),
		).toEqual({
			from: null,
			to: null,
			totalOrders: 4,
			byStatus: [{ id: 1, name: "SUBMITTED", count: 2 }],
			byCustomer: [{ id: 2, name: "North Customer", count: 4 }],
			byProduct: [{ id: 3, name: "Steel", count: 4 }],
			byMonth: [{ month: "2025-03", count: 4 }],
		});
		expect(db.select).toHaveBeenCalledTimes(5);
	});

	it("uses zero when the aggregate query has no row", async () => {
		const { service } = setup([[], [], [], [], []]);
		expect(
			await service.getOrders(user([Permission.ORDERS_MANAGE_OTHER]), {}),
		).toMatchObject({
			totalOrders: 0,
			byStatus: [],
			byCustomer: [],
			byProduct: [],
			byMonth: [],
		});
	});

	it("uses reports:manage:other for full report scope independent of role", async () => {
		const { service, captures } = setup([[], [], [], [], []]);
		await service.getOrders(
			{
				...user([Permission.REPORTS_READ, Permission.REPORTS_MANAGE_OTHER]),
				role: Role.CLIENT_REPRESENTATIVE,
			},
			{},
		);

		expect(captures[0]?.where).toBeUndefined();
	});

	it("does not grant full report scope to an administrator without the permission", async () => {
		const { service, captures } = setup([[], [], [], [], []]);
		await service.getOrders(
			{ ...user([Permission.REPORTS_READ]), role: Role.ADMIN },
			{},
		);

		expect(captures[0]?.where).toBeDefined();
	});

	it.each(["2025-02-29", "not-a-date"])(
		"rejects an invalid from date: %s",
		async (from) => {
			const { service, db } = setup([]);
			await expect(service.getOrders(user([]), { from })).rejects.toMatchObject(
				{
					response: { code: API_ERROR_CODES.REPORT_DATE_INVALID },
				},
			);
			expect(db.select).not.toHaveBeenCalled();
		},
	);

	it("rejects an invalid to date before querying", async () => {
		const { service, db } = setup([]);
		await expect(
			service.getOrders(user([]), { to: "2025-13-01" }),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.REPORT_DATE_INVALID },
		});
		expect(db.select).not.toHaveBeenCalled();
	});

	it("rejects a reversed date range before querying", async () => {
		const { service, db } = setup([]);
		await expect(
			service.getOrders(user([]), { from: "2025-04-02", to: "2025-04-01" }),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.REPORT_DATE_RANGE_INVALID },
		});
		expect(db.select).not.toHaveBeenCalled();
	});

	it("limits report rows to the authenticated user without manage-other", async () => {
		const { service, captures } = setup([[], [], [], [], []]);
		await service.getOrders(user([Permission.REPORTS_READ]), {});

		const condition = captures[0]?.where;
		const compiled = new PgDialect().sqlToQuery(condition as never);
		expect(compiled.sql).toContain("created_by_user_id");
		expect(compiled.params).toContain(9);
	});

	it("scopes customer-assigned reports to the assigned customer", async () => {
		const { service, captures } = setup([[], [], [], [], []]);
		await service.getOrders(user([Permission.REPORTS_READ], 42), {});

		const condition = captures[0]?.where;
		const compiled = new PgDialect().sqlToQuery(condition as never);
		expect(compiled.sql).toContain("customer_id");
		expect(compiled.params).toContain(42);
		expect(compiled.params).not.toContain(9);
	});

	it("includes the entire final day in a bounded report", async () => {
		const { service, captures } = setup([[], [], [], [], []]);
		await service.getOrders(user([Permission.ORDERS_MANAGE_OTHER]), {
			from: "2025-03-01",
			to: "2025-03-03",
		});

		const compiled = new PgDialect().sqlToQuery(captures[0]?.where as never);
		expect(compiled.params).toContain("2025-03-01 00:00:00");
		expect(compiled.params).toContain("2025-03-04 00:00:00");
	});
});
