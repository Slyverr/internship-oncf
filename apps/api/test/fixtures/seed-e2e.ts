import { RegistrationStatus, Role } from "@ecommand/shared";
import bcrypt from "bcryptjs";
import { relations } from "drizzle/relations";
import { customers, userCustomers, users } from "drizzle/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ROLES } from "@/database/reference-data";
import { E2E_CUSTOMERS, E2E_PASSWORD, E2E_USERS } from "./e2e-fixtures";

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
				ice: "100000000000001",
				isActive: true,
			},
			{
				companyName: "E2E Assigned Customer B",
				customerCode: E2E_CUSTOMERS.assignedB,
				ice: "100000000000002",
				isActive: true,
			},
			{
				companyName: "E2E Outside Customer",
				customerCode: E2E_CUSTOMERS.outside,
				ice: "100000000000003",
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
}

seed()
	.then(() => pool.end())
	.catch(async (error) => {
		console.error("E2E fixture seeding failed:", error);
		await pool.end();
		process.exit(1);
	});
