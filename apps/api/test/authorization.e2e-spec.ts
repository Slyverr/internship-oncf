import {
	ClaimStatus,
	ClaimType,
	OrderStatus,
	ProgramStatus,
	Role,
} from "@ecommand/shared";
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
	let claimNumbers: Record<string, string>;
	let programIds: Record<string, number>;

	beforeAll(async () => {
		app = await createE2eApp();
		const getRows = async (path: string, username: string) => {
			const token = await login(app, username);
			const response = await request(app.getHttpServer())
				.get(path)
				.set("Authorization", `Bearer ${token}`)
				.expect(200);
			return response.body;
		};
		const assignedAgent = E2E_USERS.agentAssigned.employeeCode;
		const outsideAgent = E2E_USERS.agentOutside.employeeCode;

		const customerRows = [
			...(await getRows("/customers", assignedAgent)),
			...(await getRows("/customers", outsideAgent)),
		];
		customerIds = Object.fromEntries(
			customerRows
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

		const orderRows = [
			...(await getRows("/orders", assignedAgent)),
			...(await getRows("/orders", outsideAgent)),
		];
		orderIds = Object.fromEntries(
			orderRows
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

		const claimRows = [
			...(await getRows("/claims", assignedAgent)),
			...(await getRows("/claims", outsideAgent)),
		];
		claimIds = Object.fromEntries(
			claimRows
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
		claimNumbers = Object.fromEntries(
			claimRows
				.filter((claim: { description: string }) =>
					Object.values(E2E_CLAIMS).includes(
						claim.description as (typeof E2E_CLAIMS)[keyof typeof E2E_CLAIMS],
					),
				)
				.map((claim: { claimNumber: string; description: string }) => [
					claim.description,
					claim.claimNumber,
				]),
		);

		for (const description of Object.values(E2E_CLAIMS)) {
			expect(claimIds[description]).toEqual(expect.any(Number));
			expect(claimNumbers[description]).toMatch(/^CLM-[A-Z0-9]{10}$/);
		}

		const programRows = [
			...(await getRows("/programs", assignedAgent)),
			...(await getRows("/programs", outsideAgent)),
		];
		programIds = Object.fromEntries(
			programRows
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

	it("returns and searches claims by stable claim number", async () => {
		const token = await login(app, E2E_USERS.agentAssigned.employeeCode);
		const claimNumber = claimNumbers[E2E_CLAIMS.assignedA];
		const searched = await request(app.getHttpServer())
			.get("/claims")
			.query({ search: claimNumber })
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(searched.body).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: claimIds[E2E_CLAIMS.assignedA],
					claimNumber,
				}),
			]),
		);

		const detail = await request(app.getHttpServer())
			.get(`/claims/${claimNumber}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(detail.body.claimNumber).toBe(claimNumber);
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

		await request(app.getHttpServer())
			.get(`/orders/${orderIds[E2E_ORDERS.assignedA]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);

		await request(app.getHttpServer())
			.get(`/claims/${claimNumbers[E2E_CLAIMS.assignedA]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);
	});

	it("limits administrators to account administration and reports", async () => {
		const adminToken = await login(app, E2E_USERS.admin.email);
		await request(app.getHttpServer())
			.get("/users")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);
		await request(app.getHttpServer())
			.get("/reports/orders")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);

		for (const path of ["/customers", "/orders", "/programs", "/claims"]) {
			await request(app.getHttpServer())
				.get(path)
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(403);
		}

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

	it("lets administrators assign and remove agent customer portfolios", async () => {
		const adminToken = await login(app, E2E_USERS.admin.email);
		const users = await request(app.getHttpServer())
			.get("/users")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);
		const unassignedAgent = users.body.find(
			(user: { employeeCode: string }) =>
				user.employeeCode === E2E_USERS.agentUnassigned.employeeCode,
		);
		expect(unassignedAgent).toBeDefined();

		const assigned = await request(app.getHttpServer())
			.put(`/users/${unassignedAgent.id}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				role: Role.AGENT_COMMERCIAL,
				customerIds: [customerIds[E2E_CUSTOMERS.assignedA]],
			})
			.expect(200);
		expect(assigned.body.userCustomers).toEqual([
			{ customerId: customerIds[E2E_CUSTOMERS.assignedA] },
		]);

		const assignedToken = await login(
			app,
			E2E_USERS.agentUnassigned.employeeCode,
		);
		const assignedCustomers = await request(app.getHttpServer())
			.get("/customers")
			.set("Authorization", `Bearer ${assignedToken}`)
			.expect(200);
		expect(
			assignedCustomers.body.map(
				(customer: { customerCode: string }) => customer.customerCode,
			),
		).toEqual([E2E_CUSTOMERS.assignedA]);

		await request(app.getHttpServer())
			.put(`/users/${unassignedAgent.id}`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ role: Role.AGENT_COMMERCIAL, customerIds: [] })
			.expect(200);
		const clearedToken = await login(
			app,
			E2E_USERS.agentUnassigned.employeeCode,
		);
		const clearedCustomers = await request(app.getHttpServer())
			.get("/customers")
			.set("Authorization", `Bearer ${clearedToken}`)
			.expect(200);
		expect(clearedCustomers.body).toEqual([]);
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

		await request(app.getHttpServer())
			.get(`/orders/${orderIds[E2E_ORDERS.outside]}`)
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

		await request(app.getHttpServer())
			.get(`/orders/${orderIds[E2E_ORDERS.outside]}`)
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
			.get(`/claims/${claimNumbers[E2E_CLAIMS.assignedASecondClient]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(403);
		await request(app.getHttpServer())
			.get(`/claims/${claimNumbers[E2E_CLAIMS.outside]}`)
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
			.get(`/claims/${claimNumbers[E2E_CLAIMS.outside]}`)
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

	it("allows clients to create and edit drafts only for their own customer", async () => {
		const token = await login(app, E2E_USERS.clientA.email);
		const sourceOrder = await request(app.getHttpServer())
			.get(`/orders/${orderIds[E2E_ORDERS.assignedA]}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		const createdOrder = await request(app.getHttpServer())
			.post("/orders")
			.set("Authorization", `Bearer ${token}`)
			.send({
				customerId: customerIds[E2E_CUSTOMERS.assignedA],
				goodsId: sourceOrder.body.goodsId,
				unitId: sourceOrder.body.unitId,
				quantityDemanded: "5",
			})
			.expect(201);

		expect(createdOrder.body.orderStatus.name).toBe(OrderStatus.DRAFT);
		expect(createdOrder.body.customerId).toBe(
			customerIds[E2E_CUSTOMERS.assignedA],
		);

		const updatedOrder = await request(app.getHttpServer())
			.patch(`/orders/${createdOrder.body.id}`)
			.set("Authorization", `Bearer ${token}`)
			.send({ supervisor: "E2E Updated Supervisor" })
			.expect(200);
		expect(updatedOrder.body.supervisor).toBe("E2E Updated Supervisor");

		await request(app.getHttpServer())
			.post("/orders")
			.set("Authorization", `Bearer ${token}`)
			.send({
				customerId: customerIds[E2E_CUSTOMERS.outside],
				goodsId: sourceOrder.body.goodsId,
				unitId: sourceOrder.body.unitId,
				quantityDemanded: "5",
			})
			.expect(403);
	});

	it("enforces order submit and approval transitions across client and agent roles", async () => {
		const orderId = orderIds[E2E_ORDERS.assignedA];
		const clientToken = await login(app, E2E_USERS.clientA.email);
		const agentToken = await login(app, E2E_USERS.agentAssigned.employeeCode);

		await request(app.getHttpServer())
			.post(`/orders/${orderId}/approve`)
			.set("Authorization", `Bearer ${agentToken}`)
			.expect(409);

		const submitted = await request(app.getHttpServer())
			.post(`/orders/${orderId}/submit`)
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(200);
		expect(submitted.body.orderStatus.name).toBe(OrderStatus.SUBMITTED);

		await request(app.getHttpServer())
			.post(`/orders/${orderId}/submit`)
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(409);

		const approved = await request(app.getHttpServer())
			.post(`/orders/${orderId}/approve`)
			.set("Authorization", `Bearer ${agentToken}`)
			.expect(200);
		expect(approved.body.orderStatus.name).toBe(OrderStatus.APPROVED);

		await request(app.getHttpServer())
			.post(`/orders/${orderId}/approve`)
			.set("Authorization", `Bearer ${agentToken}`)
			.expect(409);

		const outsideAgentToken = await login(
			app,
			E2E_USERS.agentOutside.employeeCode,
		);
		await request(app.getHttpServer())
			.post(`/orders/${orderId}/approve`)
			.set("Authorization", `Bearer ${outsideAgentToken}`)
			.expect(403);
	});

	it("runs a client claim through agent treatment, resolution, and client close", async () => {
		const clientToken = await login(app, E2E_USERS.clientA.email);
		const createdClaim = await request(app.getHttpServer())
			.post("/claims")
			.set("Authorization", `Bearer ${clientToken}`)
			.send({
				customerId: customerIds[E2E_CUSTOMERS.assignedA],
				orderId: orderIds[E2E_ORDERS.assignedA],
				type: ClaimType.OTHER,
				description: "E2E lifecycle claim for client close",
			})
			.expect(201);
		const claimNumber = createdClaim.body.claimNumber as string;
		expect(createdClaim.body.claimStatus.name).toBe(ClaimStatus.NEW);

		await request(app.getHttpServer())
			.post("/claims")
			.set("Authorization", `Bearer ${clientToken}`)
			.send({
				customerId: customerIds[E2E_CUSTOMERS.outside],
				type: ClaimType.OTHER,
				description: "E2E cross-customer claim must be denied",
			})
			.expect(403);

		await request(app.getHttpServer())
			.post(`/claims/${claimNumber}/start-progress`)
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(403);
		await request(app.getHttpServer())
			.post(`/claims/${claimNumber}/close`)
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(409);

		const secondClientToken = await login(app, E2E_USERS.clientASecond.email);
		await request(app.getHttpServer())
			.post(`/claims/${claimNumber}/comments`)
			.set("Authorization", `Bearer ${secondClientToken}`)
			.send({ content: "E2E non-owner cannot comment" })
			.expect(403);

		const agentToken = await login(app, E2E_USERS.agentAssigned.employeeCode);
		const createdByAgent = await request(app.getHttpServer())
			.post("/claims")
			.set("Authorization", `Bearer ${agentToken}`)
			.send({
				customerId: customerIds[E2E_CUSTOMERS.assignedB],
				type: ClaimType.OTHER,
				description: "E2E claim created by assigned agent",
			})
			.expect(201);
		expect(createdByAgent.body.customerId).toBe(
			customerIds[E2E_CUSTOMERS.assignedB],
		);

		await request(app.getHttpServer())
			.post("/claims")
			.set("Authorization", `Bearer ${agentToken}`)
			.send({
				customerId: customerIds[E2E_CUSTOMERS.outside],
				type: ClaimType.OTHER,
				description: "E2E agent cannot create outside portfolio",
			})
			.expect(403);

		await request(app.getHttpServer())
			.post(`/claims/${claimNumber}/comments`)
			.set("Authorization", `Bearer ${agentToken}`)
			.send({ content: "We are reviewing this claim." })
			.expect(201);

		const inProgress = await request(app.getHttpServer())
			.get(`/claims/${claimNumber}`)
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(200);
		expect(inProgress.body.claimStatus.name).toBe(ClaimStatus.IN_PROGRESS);

		const comments = await request(app.getHttpServer())
			.get(`/claims/${claimNumber}/comments`)
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(200);
		expect(comments.body).toHaveLength(1);
		expect(comments.body[0].authorName).toBe("Assigned Agent");

		const inTreatment = await request(app.getHttpServer())
			.post(`/claims/${claimNumber}/start-treatment`)
			.set("Authorization", `Bearer ${agentToken}`)
			.expect(200);
		expect(inTreatment.body.claimStatus.name).toBe(ClaimStatus.IN_TREATMENT);

		const resolved = await request(app.getHttpServer())
			.post(`/claims/${claimNumber}/resolve`)
			.set("Authorization", `Bearer ${agentToken}`)
			.send({ resolution: "E2E resolution" })
			.expect(200);
		expect(resolved.body.claimStatus.name).toBe(ClaimStatus.RESOLVED);

		const closed = await request(app.getHttpServer())
			.post(`/claims/${claimNumber}/close`)
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(200);
		expect(closed.body.claimStatus.name).toBe(ClaimStatus.CLOSED);
		expect(closed.body.resolution).toBe("E2E resolution");

		await request(app.getHttpServer())
			.post(`/claims/${claimNumber}/close`)
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(409);
	});

	it("enforces program portfolio access and runs assigned program approvals", async () => {
		const orderId = orderIds[E2E_ORDERS.assignedB];
		const assignedToken = await login(
			app,
			E2E_USERS.agentAssigned.employeeCode,
		);
		const outsideToken = await login(app, E2E_USERS.agentOutside.employeeCode);
		const unassignedToken = await login(
			app,
			E2E_USERS.agentUnassigned.employeeCode,
		);
		const clientToken = await login(app, E2E_USERS.clientA.email);
		const eligibleBefore = await request(app.getHttpServer())
			.get("/orders/eligible-for-programs")
			.set("Authorization", `Bearer ${assignedToken}`)
			.expect(200);
		expect(
			eligibleBefore.body.map(
				(order: { orderNumber: string }) => order.orderNumber,
			),
		).toEqual([E2E_ORDERS.assignedB]);
		const payload = {
			orderId,
			plannedDate: "2026-10-03T12:00:00.000Z",
			quantityPlanned: "20",
		};
		const sourceOrder = await request(app.getHttpServer())
			.get(`/orders/${orderIds[E2E_ORDERS.assignedA]}`)
			.set("Authorization", `Bearer ${clientToken}`)
			.expect(200);
		const ineligibleOrder = await request(app.getHttpServer())
			.post("/orders")
			.set("Authorization", `Bearer ${clientToken}`)
			.send({
				customerId: customerIds[E2E_CUSTOMERS.assignedA],
				goodsId: sourceOrder.body.goodsId,
				unitId: sourceOrder.body.unitId,
				quantityDemanded: "40",
			})
			.expect(201);

		await request(app.getHttpServer())
			.post("/programs")
			.set("Authorization", `Bearer ${outsideToken}`)
			.send(payload)
			.expect(403);
		await request(app.getHttpServer())
			.post("/programs")
			.set("Authorization", `Bearer ${unassignedToken}`)
			.send(payload)
			.expect(403);
		await request(app.getHttpServer())
			.post("/programs")
			.set("Authorization", `Bearer ${clientToken}`)
			.send(payload)
			.expect(403);

		const draftOrderResponse = await request(app.getHttpServer())
			.post("/programs")
			.set("Authorization", `Bearer ${assignedToken}`)
			.send({
				...payload,
				orderId: ineligibleOrder.body.id,
			})
			.expect(409);
		expect(draftOrderResponse.body.message).toBe(
			"Order is not eligible for program creation",
		);

		const createdProgram = await request(app.getHttpServer())
			.post("/programs")
			.set("Authorization", `Bearer ${assignedToken}`)
			.send(payload)
			.expect(201);
		const programId = createdProgram.body.id as number;
		expect(createdProgram.body.programStatus.name).toBe(ProgramStatus.DRAFT);

		await request(app.getHttpServer())
			.post("/programs")
			.set("Authorization", `Bearer ${assignedToken}`)
			.send(payload)
			.expect(409);

		const eligibleAfter = await request(app.getHttpServer())
			.get("/orders/eligible-for-programs")
			.set("Authorization", `Bearer ${assignedToken}`)
			.expect(200);
		expect(eligibleAfter.body).toEqual([]);

		await request(app.getHttpServer())
			.post(`/programs/${programId}/approve`)
			.set("Authorization", `Bearer ${assignedToken}`)
			.expect(409);

		const pending = await request(app.getHttpServer())
			.post(`/programs/${programId}/submit`)
			.set("Authorization", `Bearer ${assignedToken}`)
			.expect(200);
		expect(pending.body.programStatus.name).toBe(
			ProgramStatus.PENDING_APPROVAL,
		);

		const approved = await request(app.getHttpServer())
			.post(`/programs/${programId}/approve`)
			.set("Authorization", `Bearer ${assignedToken}`)
			.expect(200);
		expect(approved.body.programStatus.name).toBe(ProgramStatus.APPROVED);

		const confirmed = await request(app.getHttpServer())
			.post(`/programs/${programId}/confirm`)
			.set("Authorization", `Bearer ${assignedToken}`)
			.expect(200);
		expect(confirmed.body.programStatus.name).toBe(ProgramStatus.CONFIRMED);
		expect(
			confirmed.body.forecastProgramHistories.map(
				(event: { eventType: string }) => event.eventType,
			),
		).toEqual([
			"CREATED",
			"STATUS_CHANGED",
			"STATUS_CHANGED",
			"STATUS_CHANGED",
		]);
		expect(
			confirmed.body.forecastProgramHistories.every(
				(event: { changedByUserId: number; changedByName: string | null }) =>
					event.changedByUserId === confirmed.body.createdByUserId &&
					event.changedByName === E2E_USERS.agentAssigned.email,
			),
		).toBe(true);
	});

	afterAll(async () => {
		await app?.close();
	});
});
