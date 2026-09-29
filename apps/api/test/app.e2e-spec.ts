import { Role } from "@ecommand/shared";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types";
import { E2E_USERS } from "./fixtures/e2e-fixtures";
import { createE2eApp, login } from "./helpers/e2e-app";

describe("API bootstrap and authentication (e2e)", () => {
	let app: INestApplication<App>;

	beforeAll(async () => {
		app = await createE2eApp();
	});

	it("exposes the public health endpoint", async () => {
		await request(app.getHttpServer())
			.get("/health")
			.expect(200)
			.expect({ status: "ok" });
	});

	it("rejects invalid credentials", async () => {
		await request(app.getHttpServer())
			.post("/auth/login")
			.send({
				username: E2E_USERS.admin.email,
				password: "wrong-password",
			})
			.expect(401);
	});

	it("authenticates by email and authorizes the resulting bearer session", async () => {
		const token = await login(app, E2E_USERS.admin.email);

		const response = await request(app.getHttpServer())
			.get("/profile")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(response.body.email).toBe(E2E_USERS.admin.email);
		expect(response.body.role).toBe(Role.ADMIN);
	});

	it("authenticates internal users by employee code and authorizes the session", async () => {
		const token = await login(app, E2E_USERS.agentAssigned.employeeCode);

		const response = await request(app.getHttpServer())
			.get("/profile")
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(response.body.email).toBe(E2E_USERS.agentAssigned.email);
		expect(response.body.role).toBe(Role.AGENT_COMMERCIAL);
	});

	afterAll(async () => {
		await app?.close();
	});
});
