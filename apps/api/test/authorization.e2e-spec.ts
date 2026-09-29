import { Role } from "@ecommand/shared";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types";
import {
	E2E_CLAIMS,
	E2E_CUSTOMERS,
	E2E_ORDERS,
	E2E_PROGRAMS,
	E2E_USERS,
} from "./fixtures/e2e-fixtures";
import { createE2eApp, login } from "./helpers/e2e-app";

describe("customer portfolio authorization (e2e)", () => {
	let app: INestApplication<App>;
	let customerIds: Record<string, number>;
	let orderIds: Record<string, number>;
	let claimIds: Record<string, number>;
	let programIds: Record<string, number>;

	beforeAll(async () => {
		app = await createE2eApp();
		const adminToken = await login(app, E2E_USERS.admin.email);
		const response = await request(app.getHttpServer())
			.get("/customers")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);

		customerIds = Object.fromEntries(
			response.body
				.filter((customer: { customerCode: string }) =>
					Object.values(E2E_CUSTOMERS).includes(
						customer.customerCode as (typeof E2E_CUSTOMERS)[keyof typeof E2E_CUSTOMERS],
					),
				)
				.map((customer: { id: number; customerCode: string }) => [
					customer.customerCode,
					customer.id,
				]),
		);

		for (const customerCode of Object.values(E2E_CUSTOMERS)) {
			expect(customerIds[customerCode]).toEqual(expect.any(Number));
		}

		const ordersResponse = await request(app.getHttpServer())
			.get("/orders")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);
		orderIds = Object.fromEntries(
			ordersResponse.body
				.filter((order: { orderNumber: string }) =>
					Object.values(E2E_ORDERS).includes(
						order.orderNumber as (typeof E2E_ORDERS)[keyof typeof E2E_ORDERS],
					),
				)
				.map((order: { id: number; orderNumber: string }) => [
					order.orderNumber,
					order.id,
				]),
		);

		for (const orderNumber of Object.values(E2E_ORDERS)) {
			expect(orderIds[orderNumber]).toEqual(expect.any(Number));
		}

		const claimsResponse = await request(app.getHttpServer())
			.get("/claims")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);
		claimIds = Object.fromEntries(
			claimsResponse.body
				.filter((claim: { description: string }) =>
					Object.values(E2E_CLAIMS).includes(
						claim.description as (typeof E2E_CLAIMS)[keyof typeof E2E_CLAIMS],
					),
				)
				.map((claim: { id: number; description: string }) => [
					claim.description,
					claim.id,
				]),
		);

		for (const description of Object.values(E2E_CLAIMS)) {
			expect(claimIds[description]).toEqual(expect.any(Number));
		}

		const programsResponse = await request(app.getHttpServer())
			.get("/programs")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);
		programIds = Object.fromEntries(
			programsResponse.body
				.filter((program: { programNumber: string }) =>
					Object.values(E2E_PROGRAMS).includes(
						program.programNumber as (typeof E2E_PROGRAMS)[keyof typeof E2E_PROGRAMS],
					),
				)
				.map((program: { id: number; programNumber: string }) => [
					program.programNumber,
					program.id,
				]),
		);

		for (const programNumber of Object.values(E2E_PROGRAMS)) {
			expect(programIds[programNumber]).toEqual(expect.any(Number));
		}
	});

	it("limits an assigned agent to assigned customers and intersects search filters", async () => {
		const token = await login(app, E2E_USERS.agentAssigned.employeeCode);
		const response = await request(app.getHttpServer())
			.get("/customers")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(
			response.body.map(
				(customer: { customerCode: string }) => customer.customerCode,
			),
		).toEqual(
			expect.arrayContaining([
				E2E_CUSTOMERS.assignedA,
				E2E_CUSTOMERS.assignedB,
			]),
		);
		expect(response.body).toHaveLength(2);

		const filteredResponse = await request(app.getHttpServer())
			.get("/customers")
			.query({ search: "Outside" })
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(filteredResponse.body).toEqual([]);
	});

	it("denies an assigned agent direct access outside the portfolio", async () => {
		const token = await login(app, E2E_USERS.agentAssigned.employeeCode);

		await request(app.getHttpServer())
			.get(`/customers/${customerIds[E2E_CUSTOMERS.outside]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);
	});

	it("limits a different agent to their own portfolio", async () => {
		const token = await login(app, E2E_USERS.agentOutside.employeeCode);
		const response = await request(app.getHttpServer())
			.get("/customers")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(
			response.body.map(
				(customer: { customerCode: string }) => customer.customerCode,
			),
		).toEqual([E2E_CUSTOMERS.outside]);

		await request(app.getHttpServer())
			.get(`/customers/${customerIds[E2E_CUSTOMERS.assignedA]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);
	});

	it("returns no scoped customers and denies direct access for an unassigned agent", async () => {
		const token = await login(app, E2E_USERS.agentUnassigned.employeeCode);
		const response = await request(app.getHttpServer())
			.get("/customers")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(response.body).toEqual([]);

		await request(app.getHttpServer())
			.get(`/customers/${customerIds[E2E_CUSTOMERS.assignedA]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);

		const ordersResponse = await request(app.getHttpServer())
			.get("/orders")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(ordersResponse.body).toEqual([]);

		const claimsResponse = await request(app.getHttpServer())
			.get("/claims")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(claimsResponse.body).toEqual([]);

		const adminToken = await login(app, E2E_USERS.admin.email);
		const adminOrders = await request(app.getHttpServer())
			.get("/orders")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);
		const assignedOrder = adminOrders.body.find(
			(order: { orderNumber: string; id: number }) =>
				order.orderNumber === E2E_ORDERS.assignedA,
		);

		expect(assignedOrder).toBeDefined();
		await request(app.getHttpServer())
			.get(`/orders/${assignedOrder.id}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);

		await request(app.getHttpServer())
			.get(`/claims/${claimIds[E2E_CLAIMS.assignedA]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);
	});

	it("keeps administrator portfolio access and denies clients the customer directory", async () => {
		const adminToken = await login(app, E2E_USERS.admin.email);
		const adminResponse = await request(app.getHttpServer())
			.get("/customers")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);

		expect(adminResponse.body).toHaveLength(3);
		await request(app.getHttpServer())
			.get(`/customers/${customerIds[E2E_CUSTOMERS.outside]}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);

		const clientToken = await login(app, E2E_USERS.clientA.email);
		const clientProfile = await request(app.getHttpServer())
			.get("/profile")
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(200);

		expect(clientProfile.body.role).toBe(Role.CLIENT_REPRESENTATIVE);
		await request(app.getHttpServer())
			.get("/customers")
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(403);
	});

	it("scopes client order lists and direct reads to the linked customer", async () => {
		const clientToken = await login(app, E2E_USERS.clientA.email);
		const response = await request(app.getHttpServer())
			.get("/orders")
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(200);

		expect(
			response.body.map((order: { orderNumber: string }) => order.orderNumber),
		).toEqual([E2E_ORDERS.assignedA]);

		const adminToken = await login(app, E2E_USERS.admin.email);
		const adminOrders = await request(app.getHttpServer())
			.get("/orders")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);
		const outsideOrder = adminOrders.body.find(
			(order: { orderNumber: string; id: number }) =>
				order.orderNumber === E2E_ORDERS.outside,
		);

		expect(outsideOrder).toBeDefined();
		await request(app.getHttpServer())
			.get(`/orders/${outsideOrder.id}`)
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(403);
	});

	it("keeps order query filters inside an agent portfolio and denies outside order IDs", async () => {
		const token = await login(app, E2E_USERS.agentAssigned.employeeCode);
		const response = await request(app.getHttpServer())
			.get("/orders")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(
			response.body.map((order: { orderNumber: string }) => order.orderNumber),
		).toEqual(
			expect.arrayContaining([E2E_ORDERS.assignedA, E2E_ORDERS.assignedB]),
		);
		expect(response.body).toHaveLength(2);

		const excludedFilter = await request(app.getHttpServer())
			.get("/orders")
			.query({ customerId: customerIds[E2E_CUSTOMERS.outside] })
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(excludedFilter.body).toEqual([]);

		const adminToken = await login(app, E2E_USERS.admin.email);
		const adminOrders = await request(app.getHttpServer())
			.get("/orders")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);
		const outsideOrder = adminOrders.body.find(
			(order: { orderNumber: string; id: number }) =>
				order.orderNumber === E2E_ORDERS.outside,
		);

		expect(outsideOrder).toBeDefined();
		await request(app.getHttpServer())
			.get(`/orders/${outsideOrder.id}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);
	});

	it("limits clients to their own claims and cannot widen scope with a customer filter", async () => {
		const token = await login(app, E2E_USERS.clientA.email);
		const response = await request(app.getHttpServer())
			.get("/claims")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(
			response.body.map((claim: { description: string }) => claim.description),
		).toEqual([E2E_CLAIMS.assignedA]);

		const filteredResponse = await request(app.getHttpServer())
			.get("/claims")
			.query({ customerId: customerIds[E2E_CUSTOMERS.outside] })
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(
			filteredResponse.body.map(
				(claim: { description: string }) => claim.description,
			),
		).toEqual([E2E_CLAIMS.assignedA]);

		await request(app.getHttpServer())
			.get(`/claims/${claimIds[E2E_CLAIMS.assignedASecondClient]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);
		await request(app.getHttpServer())
			.get(`/claims/${claimIds[E2E_CLAIMS.outside]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);
	});

	it("scopes agent claim lists and direct access to assigned customers", async () => {
		const token = await login(app, E2E_USERS.agentAssigned.employeeCode);
		const response = await request(app.getHttpServer())
			.get("/claims")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(
			response.body.map((claim: { description: string }) => claim.description),
		).toEqual(
			expect.arrayContaining([
				E2E_CLAIMS.assignedA,
				E2E_CLAIMS.assignedASecondClient,
				E2E_CLAIMS.assignedBAgent,
			]),
		);
		expect(response.body).toHaveLength(3);

		const excludedFilter = await request(app.getHttpServer())
			.get("/claims")
			.query({ customerId: customerIds[E2E_CUSTOMERS.outside] })
			.set("Authorization", `Bearer ${token}`)
			.expect(200);
		expect(excludedFilter.body).toEqual([]);

		await request(app.getHttpServer())
			.get(`/claims/${claimIds[E2E_CLAIMS.outside]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);
	});

	it("scopes forecast programs to their linked order customer", async () => {
		const assignedToken = await login(
			app,
			E2E_USERS.agentAssigned.employeeCode,
		);
		const assignedResponse = await request(app.getHttpServer())
			.get("/programs")
			.set("Authorization", `Bearer ${assignedToken}`)
			.expect(200);
		expect(
			assignedResponse.body.map(
				(program: { programNumber: string }) => program.programNumber,
			),
		).toEqual([E2E_PROGRAMS.assignedA]);

		const outsideProgramFilter = await request(app.getHttpServer())
			.get("/programs")
			.query({ orderId: orderIds[E2E_ORDERS.outside] })
			.set("Authorization", `Bearer ${assignedToken}`)
			.expect(200);
		expect(outsideProgramFilter.body).toEqual([]);

		await request(app.getHttpServer())
			.get(`/programs/${programIds[E2E_PROGRAMS.outside]}`)
			.set("Authorization", `Bearer ${assignedToken}`)
			.expect(403);

		const outsideToken = await login(app, E2E_USERS.agentOutside.employeeCode);
		const outsideResponse = await request(app.getHttpServer())
			.get("/programs")
			.set("Authorization", `Bearer ${outsideToken}`)
			.expect(200);
		expect(
			outsideResponse.body.map(
				(program: { programNumber: string }) => program.programNumber,
			),
		).toEqual([E2E_PROGRAMS.outside]);

		const clientToken = await login(app, E2E_USERS.clientA.email);
		const clientResponse = await request(app.getHttpServer())
			.get("/programs")
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(200);
		expect(
			clientResponse.body.map(
				(program: { programNumber: string }) => program.programNumber,
			),
		).toEqual([E2E_PROGRAMS.assignedA]);

		const unassignedToken = await login(
			app,
			E2E_USERS.agentUnassigned.employeeCode,
		);
		const unassignedResponse = await request(app.getHttpServer())
			.get("/programs")
			.set("Authorization", `Bearer ${unassignedToken}`)
			.expect(200);
		expect(unassignedResponse.body).toEqual([]);
	});

	it("scopes order report aggregates to client and agent portfolios", async () => {
		const cases = [
			{
				username: E2E_USERS.admin.email,
				total: 3,
				customers: [
					"E2E Assigned Customer A",
					"E2E Assigned Customer B",
					"E2E Outside Customer",
				],
			},
			{
				username: E2E_USERS.agentAssigned.employeeCode,
				total: 2,
				customers: ["E2E Assigned Customer A", "E2E Assigned Customer B"],
			},
			{
				username: E2E_USERS.agentOutside.employeeCode,
				total: 1,
				customers: ["E2E Outside Customer"],
			},
			{
				username: E2E_USERS.agentUnassigned.employeeCode,
				total: 0,
				customers: [],
			},
			{
				username: E2E_USERS.clientA.email,
				total: 1,
				customers: ["E2E Assigned Customer A"],
			},
		];

		for (const testCase of cases) {
			const token = await login(app, testCase.username);
			const response = await request(app.getHttpServer())
				.get("/reports/orders")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);

			expect(response.body.totalOrders).toBe(testCase.total);
			expect(
				response.body.byCustomer.map(
					(customer: { name: string }) => customer.name,
				),
			).toEqual(expect.arrayContaining(testCase.customers));
			expect(response.body.byCustomer).toHaveLength(testCase.customers.length);
		}
	});

	afterAll(async () => {
		await app?.close();
	});
});
