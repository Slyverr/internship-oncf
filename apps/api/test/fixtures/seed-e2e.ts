import {
	ClaimStatus,
	ClaimType,
	OrderStatus,
	ProgramStatus,
	RegistrationStatus,
	Role,
} from "@ecommand/shared";
import bcrypt from "bcryptjs";
import { relations } from "drizzle/relations";
import {
	claims,
	customers,
	forecastPrograms,
	goods,
	orders,
	passwordResetTokens,
	userCustomers,
	users,
} from "drizzle/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
	CLAIM_STATUSES,
	CLAIM_TYPES,
	GOODS_TYPES,
	ORDER_STATUSES,
	PROGRAM_STATUSES,
	ROLES,
	UNITS,
} from "@/database/reference-data";
import {
	E2E_CLAIMS,
	E2E_CUSTOMER_ICE,
	E2E_CUSTOMERS,
	E2E_ORDERS,
	E2E_PASSWORD,
	E2E_PASSWORD_RESET,
	E2E_PROGRAMS,
	E2E_USERS,
} from "./e2e-fixtures";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("DATABASE_URL is required to seed E2E fixtures");
}

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle({ client: pool, relations });

async function seed() {
	const customerRows = await db
		.insert(customers)
		.values([
			{
				companyName: "E2E Assigned Customer A",
				customerCode: E2E_CUSTOMERS.assignedA,
				ice: E2E_CUSTOMER_ICE.assignedA,
				isActive: true,
			},
			{
				companyName: "E2E Assigned Customer B",
				customerCode: E2E_CUSTOMERS.assignedB,
				ice: E2E_CUSTOMER_ICE.assignedB,
				isActive: true,
			},
			{
				companyName: "E2E Outside Customer",
				customerCode: E2E_CUSTOMERS.outside,
				ice: E2E_CUSTOMER_ICE.outside,
				isActive: true,
			},
		])
		.returning({ id: customers.id, customerCode: customers.customerCode });

	const customerIds = new Map(
		customerRows.map((customer) => [customer.customerCode, customer.id]),
	);
	const customerId = (code: string) => {
		const id = customerIds.get(code);
		if (!id) throw new Error(`Missing E2E customer ${code}`);
		return id;
	};

	const password = await bcrypt.hash(E2E_PASSWORD, 10);
	const userRows = await db
		.insert(users)
		.values([
			{
				email: E2E_USERS.admin.email,
				employeeCode: E2E_USERS.admin.employeeCode,
				password,
				firstName: "E2E",
				lastName: "Admin",
				type: "internal",
				roleId: ROLES[Role.ADMIN].id,
				registrationStatus: RegistrationStatus.APPROVED,
				isActive: true,
			},
			{
				email: E2E_USERS.agentAssigned.email,
				employeeCode: E2E_USERS.agentAssigned.employeeCode,
				password,
				firstName: "Assigned",
				lastName: "Agent",
				type: "internal",
				roleId: ROLES[Role.AGENT_COMMERCIAL].id,
				registrationStatus: RegistrationStatus.APPROVED,
				isActive: true,
			},
			{
				email: E2E_USERS.agentOutside.email,
				employeeCode: E2E_USERS.agentOutside.employeeCode,
				password,
				firstName: "Outside",
				lastName: "Agent",
				type: "internal",
				roleId: ROLES[Role.AGENT_COMMERCIAL].id,
				registrationStatus: RegistrationStatus.APPROVED,
				isActive: true,
			},
			{
				email: E2E_USERS.agentUnassigned.email,
				employeeCode: E2E_USERS.agentUnassigned.employeeCode,
				password,
				firstName: "Unassigned",
				lastName: "Agent",
				type: "internal",
				roleId: ROLES[Role.AGENT_COMMERCIAL].id,
				registrationStatus: RegistrationStatus.APPROVED,
				isActive: true,
			},
			{
				email: E2E_USERS.clientA.email,
				password,
				firstName: "Client",
				lastName: "A",
				type: "external",
				roleId: ROLES[Role.CLIENT_REPRESENTATIVE].id,
				customerId: customerId(E2E_CUSTOMERS.assignedA),
				registrationStatus: RegistrationStatus.APPROVED,
				isActive: true,
			},
			{
				email: E2E_USERS.clientASecond.email,
				password,
				firstName: "Client",
				lastName: "A Second",
				type: "external",
				roleId: ROLES[Role.CLIENT_REPRESENTATIVE].id,
				customerId: customerId(E2E_CUSTOMERS.assignedA),
				registrationStatus: RegistrationStatus.APPROVED,
				isActive: true,
			},
			{
				email: E2E_USERS.clientOutside.email,
				password,
				firstName: "Client",
				lastName: "Outside",
				type: "external",
				roleId: ROLES[Role.CLIENT_REPRESENTATIVE].id,
				customerId: customerId(E2E_CUSTOMERS.outside),
				registrationStatus: RegistrationStatus.APPROVED,
				isActive: true,
			},
			{
				email: E2E_USERS.passwordReset.email,
				password,
				firstName: "Password",
				lastName: "Reset",
				type: "external",
				roleId: ROLES[Role.CLIENT_REPRESENTATIVE].id,
				customerId: customerId(E2E_CUSTOMERS.assignedA),
				registrationStatus: RegistrationStatus.APPROVED,
				isActive: true,
			},
		])
		.returning({ id: users.id, email: users.email });

	const userIds = new Map(userRows.map((user) => [user.email, user.id]));
	const userId = (email: string) => {
		const id = userIds.get(email);
		if (!id) throw new Error(`Missing E2E user ${email}`);
		return id;
	};

	await db.insert(userCustomers).values([
		{
			userId: userId(E2E_USERS.agentAssigned.email),
			customerId: customerId(E2E_CUSTOMERS.assignedA),
		},
		{
			userId: userId(E2E_USERS.agentAssigned.email),
			customerId: customerId(E2E_CUSTOMERS.assignedB),
		},
		{
			userId: userId(E2E_USERS.agentOutside.email),
			customerId: customerId(E2E_CUSTOMERS.outside),
		},
	]);

	await db.insert(passwordResetTokens).values([
		{
			userId: userId(E2E_USERS.passwordReset.email),
			token: E2E_PASSWORD_RESET.valid,
			expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
		},
		{
			userId: userId(E2E_USERS.passwordReset.email),
			token: E2E_PASSWORD_RESET.expired,
			expiresAt: new Date(Date.now() - 60 * 60_000).toISOString(),
		},
	]);

	const [good] = await db
		.insert(goods)
		.values({
			name: "E2E Test Cereals",
			goodsTypeId: GOODS_TYPES.CEREALS.id,
			goodsCode: "E2E-GOOD",
		})
		.returning({ id: goods.id });
	const draftStatus = ORDER_STATUSES[OrderStatus.DRAFT];
	const approvedStatus = ORDER_STATUSES[OrderStatus.APPROVED];

	const orderRows = await db
		.insert(orders)
		.values([
			{
				goodsId: good.id,
				customerId: customerId(E2E_CUSTOMERS.assignedA),
				createdByUserId: userId(E2E_USERS.clientA.email),
				statusId: draftStatus.id,
				orderNumber: E2E_ORDERS.assignedA,
				quantityDemanded: "10",
				unitId: UNITS.TONNES.id,
			},
			{
				goodsId: good.id,
				customerId: customerId(E2E_CUSTOMERS.assignedB),
				createdByUserId: userId(E2E_USERS.agentAssigned.email),
				statusId: approvedStatus.id,
				orderNumber: E2E_ORDERS.assignedB,
				quantityDemanded: "20",
				unitId: UNITS.TONNES.id,
			},
			{
				goodsId: good.id,
				customerId: customerId(E2E_CUSTOMERS.outside),
				createdByUserId: userId(E2E_USERS.clientOutside.email),
				statusId: draftStatus.id,
				orderNumber: E2E_ORDERS.outside,
				quantityDemanded: "30",
				unitId: UNITS.TONNES.id,
			},
		])
		.returning({ id: orders.id, orderNumber: orders.orderNumber });
	const orderIds = new Map(
		orderRows.map((order) => [order.orderNumber, order.id]),
	);
	const orderId = (orderNumber: string) => {
		const id = orderIds.get(orderNumber);
		if (!id) throw new Error(`Missing E2E order ${orderNumber}`);
		return id;
	};

	await db.insert(forecastPrograms).values([
		{
			programNumber: E2E_PROGRAMS.assignedA,
			orderId: orderId(E2E_ORDERS.assignedA),
			statusId: PROGRAM_STATUSES[ProgramStatus.DRAFT].id,
			plannedDate: "2026-10-01T12:00:00.000Z",
			quantityPlanned: "10",
			createdByUserId: userId(E2E_USERS.agentAssigned.email),
		},
		{
			programNumber: E2E_PROGRAMS.outside,
			orderId: orderId(E2E_ORDERS.outside),
			statusId: PROGRAM_STATUSES[ProgramStatus.DRAFT].id,
			plannedDate: "2026-10-02T12:00:00.000Z",
			quantityPlanned: "30",
			createdByUserId: userId(E2E_USERS.agentOutside.email),
		},
	]);

	await db.insert(claims).values([
		{
			customerId: customerId(E2E_CUSTOMERS.assignedA),
			createdByUserId: userId(E2E_USERS.clientA.email),
			typeId: CLAIM_TYPES[ClaimType.OTHER].id,
			statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
			description: E2E_CLAIMS.assignedA,
		},
		{
			customerId: customerId(E2E_CUSTOMERS.assignedA),
			createdByUserId: userId(E2E_USERS.clientASecond.email),
			typeId: CLAIM_TYPES[ClaimType.OTHER].id,
			statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
			description: E2E_CLAIMS.assignedASecondClient,
		},
		{
			customerId: customerId(E2E_CUSTOMERS.assignedB),
			createdByUserId: userId(E2E_USERS.agentAssigned.email),
			typeId: CLAIM_TYPES[ClaimType.OTHER].id,
			statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
			description: E2E_CLAIMS.assignedBAgent,
		},
		{
			customerId: customerId(E2E_CUSTOMERS.outside),
			createdByUserId: userId(E2E_USERS.clientOutside.email),
			typeId: CLAIM_TYPES[ClaimType.OTHER].id,
			statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
			description: E2E_CLAIMS.outside,
		},
	]);
}

seed()
	.then(() => pool.end())
	.catch(async (error) => {
		console.error("E2E fixture seeding failed:", error);
		await pool.end();
		process.exit(1);
	});
