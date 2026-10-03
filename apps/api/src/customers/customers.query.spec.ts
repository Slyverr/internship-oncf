import { CustomersQuery } from "./customers.query";

function setup() {
	const findMany = jest.fn().mockResolvedValue([]);
	const findFirst = jest.fn().mockResolvedValue(undefined);
	const query = new CustomersQuery({
		db: { query: { customers: { findMany, findFirst } } },
	} as never);

	return { query, findMany, findFirst };
}

describe("CustomersQuery", () => {
	it("falls back to the default sort for unsupported relation columns", async () => {
		const { query, findMany } = setup();

		await query.findCustomers({
			page: 1,
			limit: 20,
			sortBy: "customerType",
			sortOrder: "asc",
		});

		expect(findMany.mock.calls[0][0].orderBy).toEqual({ createdAt: "asc" });
	});

	it("combines portfolio scope, filters, sorting, and pagination", async () => {
		const { query, findMany } = setup();

		await query.findCustomers(
			{
				page: 2,
				limit: 10,
				search: "rail",
				typeId: "customer-type-id",
				isActive: true,
				sortBy: "companyName",
				sortOrder: "asc",
			},
			[4, 8],
		);

		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					id: { in: [4, 8] },
					typeId: "customer-type-id",
					isActive: true,
					OR: [
						{ companyName: { ilike: "%rail%" } },
						{ customerCode: { ilike: "%rail%" } },
						{ city: { ilike: "%rail%" } },
						{ email: { ilike: "%rail%" } },
						{ phone: { ilike: "%rail%" } },
					],
				},
				orderBy: { companyName: "asc" },
				limit: 10,
				offset: 10,
			}),
		);
	});

	it("keeps an empty customer portfolio restricted to no customers", async () => {
		const { query, findMany } = setup();

		await query.findCustomers({ page: 1, limit: 20 }, []);

		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: { in: [] } } }),
		);
	});

	it("leaves customer scope unrestricted only when no portfolio was supplied", async () => {
		const { query, findMany } = setup();

		await query.findCustomers({ page: 1, limit: 20 });

		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: {} }),
		);
	});

	it("exposes only active customers as agent portfolio options", async () => {
		const { query, findMany } = setup();

		await query.findPortfolioOptions();

		expect(findMany).toHaveBeenCalledWith({
			where: { isActive: true },
			columns: { id: true, companyName: true, customerCode: true },
			orderBy: { companyName: "asc" },
		});
	});

	it("matches signup against an active customer with both submitted identifiers", async () => {
		const { query, findFirst } = setup();

		await query.findActiveCustomerForRegistration("CUS-ABCDEFG123", "ICE123");

		expect(findFirst).toHaveBeenCalledWith({
			where: {
				customerCode: "CUS-ABCDEFG123",
				ice: "ICE123",
				isActive: true,
			},
			columns: { id: true },
		});
	});

	it("loads one customer with its customer type and public profile fields", async () => {
		const { query, findFirst } = setup();

		await query.findCustomer(12);

		expect(findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { id: 12 },
				columns: expect.objectContaining({ ice: true, customerCode: true }),
				with: { customerType: { columns: { name: true } } },
			}),
		);
	});
});
