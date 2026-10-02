export const E2E_PASSWORD = "e2e-password-123";

export const E2E_PASSWORD_RESET = {
	valid: "e2e-password-reset-valid-token",
	expired: "e2e-password-reset-expired-token",
} as const;

export const E2E_CUSTOMERS = {
	assignedA: "E2E-CUST-A",
	assignedB: "E2E-CUST-B",
	outside: "E2E-CUST-C",
} as const;

export const E2E_CUSTOMER_ICE = {
	assignedA: "100000000000001",
	assignedB: "100000000000002",
	outside: "100000000000003",
} as const;

export const E2E_ORDERS = {
	assignedA: "ORD-E2E0000001",
	assignedB: "ORD-E2E0000002",
	outside: "ORD-E2E0000003",
} as const;

export const E2E_CLAIMS = {
	assignedA: "E2E Claim A owned by first client",
	assignedASecondClient: "E2E Claim A owned by second client",
	assignedBAgent: "E2E Claim B owned by assigned agent",
	outside: "E2E Claim outside agent portfolio",
} as const;

export const E2E_PROGRAMS = {
	assignedA: "PRG-E2E0000001",
	outside: "PRG-E2E0000002",
} as const;

export const E2E_USERS = {
	admin: {
		email: "e2e.admin@example.test",
		employeeCode: "E2E-EMP-ADMIN",
	},
	agentAssigned: {
		email: "e2e.agent.assigned@example.test",
		employeeCode: "E2E-EMP-AGENT-A",
	},
	agentOutside: {
		email: "e2e.agent.outside@example.test",
		employeeCode: "E2E-EMP-AGENT-B",
	},
	agentUnassigned: {
		email: "e2e.agent.unassigned@example.test",
		employeeCode: "E2E-EMP-AGENT-NONE",
	},
	clientA: {
		email: "e2e.client.a@example.test",
		employeeCode: null,
	},
	clientASecond: {
		email: "e2e.client.a2@example.test",
		employeeCode: null,
	},
	clientOutside: {
		email: "e2e.client.outside@example.test",
		employeeCode: null,
	},
	passwordReset: {
		email: "e2e.password.reset@example.test",
		employeeCode: null,
	},
} as const;
