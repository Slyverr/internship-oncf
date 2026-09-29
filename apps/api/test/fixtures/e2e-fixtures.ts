export const E2E_PASSWORD = "e2e-password-123";

export const E2E_CUSTOMERS = {
	assignedA: "E2E-CUST-A",
	assignedB: "E2E-CUST-B",
	outside: "E2E-CUST-C",
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
} as const;
