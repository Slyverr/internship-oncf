import { Role } from "@ecommand/shared";
import { NotFoundException } from "@nestjs/common";
import type { AuthUser } from "@/auth/auth.types";
import { CustomersMapper } from "./customers.mapper";
import { CustomersQuery } from "./customers.query";
import { CustomersService } from "./customers.service";
import type { CustomerId } from "./customers.types";

describe("CustomersService", () => {
	const query = {
		findCustomers: jest.fn(),
		findCustomer: jest.fn(),
		findActiveCustomerForRegistration: jest.fn(),
		createCustomer: jest.fn(),
		updateCustomer: jest.fn(),
	};
	const mapper = {
		toCreate: jest.fn(),
		toUpdate: jest.fn(),
	};
	const service = new CustomersService(
		query as unknown as CustomersQuery,
		mapper as unknown as CustomersMapper,
	);
	const id = 8 as CustomerId;
	const customer = { id, companyName: "Example Ltd" };
	const adminUser: AuthUser = {
		id: 1,
		email: "admin@oncf.ma",
		role: Role.ADMIN,
		permissions: new Set(),
		sessionId: "test-session",
		customerId: null,
		agencyId: null,
		assignedCustomerIds: [],
	};

	beforeEach(() => {
		for (const mock of Object.values(query)) mock.mockReset();
		for (const mock of Object.values(mapper)) mock.mockReset();
	});

	it("passes list filters to the query", async () => {
		const filters = { search: "example" } as never;
		query.findCustomers.mockResolvedValue([customer]);
		await expect(service.findAll(filters, adminUser)).resolves.toEqual([
			customer,
		]);
		expect(query.findCustomers).toHaveBeenCalledWith(filters, undefined);
	});

	it("returns a customer and reports a missing record", async () => {
		query.findCustomer.mockResolvedValue(customer);
		await expect(service.findOne(id)).resolves.toBe(customer);
		query.findCustomer.mockResolvedValue(undefined);
		await expect(service.findOne(id)).rejects.toBeInstanceOf(NotFoundException);
	});

	it("looks up only a customer with the exact signup identifiers", async () => {
		query.findActiveCustomerForRegistration.mockResolvedValue({ id } as never);
		await expect(
			service.findActiveCustomerForRegistration("CLI009", "123456789012345"),
		).resolves.toEqual({ id });
		expect(query.findActiveCustomerForRegistration).toHaveBeenCalledWith(
			"CLI009",
			"123456789012345",
		);
	});

	it("maps and persists a new customer, then returns its detail", async () => {
		const dto = { companyName: "Example Ltd" } as never;
		const values = { companyName: "Example Ltd" };
		mapper.toCreate.mockReturnValue(values);
		query.createCustomer.mockResolvedValue({ id });
		query.findCustomer.mockResolvedValue(customer);
		await expect(service.create(dto)).resolves.toBe(customer);
		expect(mapper.toCreate).toHaveBeenCalledWith(dto);
		expect(query.createCustomer).toHaveBeenCalledWith(values);
	});

	it("maps updates and returns the updated customer", async () => {
		const dto = { companyName: "New Name" } as never;
		const values = { companyName: "New Name" };
		mapper.toUpdate.mockReturnValue(values);
		query.updateCustomer.mockResolvedValue({ id });
		query.findCustomer.mockResolvedValue(customer);
		await expect(service.update(id, dto, adminUser)).resolves.toBe(customer);
		expect(mapper.toUpdate).toHaveBeenCalledWith(dto);
		expect(query.updateCustomer).toHaveBeenCalledWith(id, values);
	});

	it("deactivates an existing customer and reports a missing record", async () => {
		query.updateCustomer.mockResolvedValue({ ...customer, isActive: false });
		await expect(service.deactivate(id)).resolves.toMatchObject({
			isActive: false,
		});
		expect(query.updateCustomer).toHaveBeenCalledWith(id, { isActive: false });
		query.updateCustomer.mockResolvedValue(undefined);
		await expect(service.deactivate(id)).rejects.toBeInstanceOf(
			NotFoundException,
		);
	});
});
