import {
	API_ERROR_CODES,
	API_RESPONSE_CODES,
	type AppearancePreferences,
	OrderStatus,
	ProgramStatus,
	RegistrationStatus,
	Role,
} from "@ecommand/shared";
import type { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { forecastPrograms, users } from "drizzle/schema";
import { eq } from "drizzle-orm";
import request from "supertest";
import type { App } from "supertest/types";
import { DrizzleService } from "@/database/drizzle.service";
import { DTM_REQUEST_TYPES, PROGRAM_STATUSES } from "@/database/reference-data";
import {
	E2E_CUSTOMER_ICE,
	E2E_CUSTOMERS,
	E2E_ORDERS,
	E2E_PASSWORD,
	E2E_PASSWORD_RESET,
	E2E_PROGRAMS,
	E2E_USERS,
} from "./fixtures/e2e-fixtures";
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
		const response = await request(app.getHttpServer())
			.post("/auth/login")
			.send({
				username: E2E_USERS.admin.email,
				password: "wrong-password",
			})
			.expect(401);

		expect(response.body).toEqual({
			code: API_ERROR_CODES.AUTHENTICATION_REQUIRED,
			statusCode: 401,
		});
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

	it("records a program send and applies a delayed simulated DTM acknowledgement", async () => {
		const drizzle = app.get(DrizzleService);
		const [program] = await drizzle.db
			.update(forecastPrograms)
			.set({ statusId: PROGRAM_STATUSES[ProgramStatus.CONFIRMED].id })
			.where(eq(forecastPrograms.programNumber, E2E_PROGRAMS.assignedA))
			.returning({ id: forecastPrograms.id });
		expect(program).toBeDefined();

		const token = await login(app, E2E_USERS.agentAssigned.email);
		const response = await request(app.getHttpServer())
			.post(`/programs/${E2E_PROGRAMS.assignedA}/send`)
			.set("Authorization", `Bearer ${token}`)
			.expect(200);
		expect(response.body).toMatchObject({
			programStatus: { name: ProgramStatus.SENT_TO_DTM },
			dtmStatus: "PENDING",
		});

		const pendingLog = await drizzle.db.query.dtmIntegrationLog.findFirst({
			where: { relatedEntityId: program.id },
		});
		expect(pendingLog).toMatchObject({
			status: "PENDING",
			httpStatusCode: 202,
			relatedEntityType: "forecast_programs",
		});

		await new Promise((resolve) => setTimeout(resolve, 100));
		const [completedLog, completedProgram] = await Promise.all([
			drizzle.db.query.dtmIntegrationLog.findFirst({
				where: { id: pendingLog?.id ?? -1 },
			}),
			drizzle.db.query.forecastPrograms.findFirst({
				where: { id: program.id },
				columns: { dtmStatus: true },
			}),
		]);
		expect(completedLog).toMatchObject({
			status: "SUCCESS",
			httpStatusCode: 200,
		});
		expect(completedLog?.respondedAt).not.toBeNull();
		expect(completedProgram?.dtmStatus).toBe("ACCEPTED");
	});

	it("records an order send and applies a simulated DTM acknowledgement", async () => {
		const drizzle = app.get(DrizzleService);
		const token = await login(app, E2E_USERS.agentAssigned.employeeCode);
		const response = await request(app.getHttpServer())
			.post(`/orders/${E2E_ORDERS.assignedB}/send-to-dtm`)
			.set("Authorization", `Bearer ${token}`)
			.expect(200);

		expect(response.body.orderStatus.name).toBe(OrderStatus.SENT_TO_DTM);
		expect(["PENDING", "SUCCESS"]).toContain(response.body.dtmRequestStatus);

		const sentOrder = await drizzle.db.query.orders.findFirst({
			where: { orderNumber: E2E_ORDERS.assignedB },
			columns: { id: true },
		});
		expect(sentOrder).toBeDefined();

		const requestLog = await drizzle.db.query.dtmIntegrationLog.findFirst({
			where: {
				relatedEntityId: sentOrder?.id,
				relatedEntityType: "orders",
			},
		});
		expect(requestLog).toMatchObject({
			requestTypeId: DTM_REQUEST_TYPES.SEND_ORDER.id,
			relatedEntityType: "orders",
		});
		expect(["PENDING", "SUCCESS"]).toContain(requestLog?.status);
		expect([202, 200]).toContain(requestLog?.httpStatusCode);
		expect(JSON.parse(requestLog?.requestPayload ?? "{}")).toMatchObject({
			contract: "ecommand-dtm-simulator-v1",
			order: { orderNumber: E2E_ORDERS.assignedB },
		});

		let completedLog = requestLog;
		for (let attempt = 0; attempt < 20; attempt++) {
			await new Promise((resolve) => setTimeout(resolve, 10));
			completedLog = await drizzle.db.query.dtmIntegrationLog.findFirst({
				where: { id: requestLog?.id ?? -1 },
			});
			if (completedLog?.status !== "PENDING") break;
		}
		expect(completedLog).toMatchObject({
			status: "SUCCESS",
			httpStatusCode: 200,
		});
		expect(JSON.parse(completedLog?.responsePayload ?? "{}")).toMatchObject({
			status: "ACCEPTED",
		});
		const refreshedOrder = await request(app.getHttpServer())
			.get(`/orders/${E2E_ORDERS.assignedB}`)
			.set("Authorization", `Bearer ${token}`)
			.expect(200);
		expect(refreshedOrder.body).toMatchObject({
			orderStatus: { name: "IN_PROGRESS" },
			dtmRequestStatus: "SUCCESS",
			dtmResponseStatus: "ACCEPTED",
		});
	});

	it("locks after the configured failed attempts, expires, and resets on success", async () => {
		const username = E2E_USERS.passwordReset.email;
		const loginRequest = (password: string) =>
			request(app.getHttpServer())
				.post("/auth/login")
				.send({ username, password });
		const maxAttempts = Number(
			app.get(ConfigService).get("AUTH_LOGIN_MAX_ATTEMPTS", 5),
		);

		for (let attempt = 0; attempt < maxAttempts - 1; attempt++) {
			const response = await loginRequest("wrong-password").expect(401);
			expect(response.body.code).toBe(API_ERROR_CODES.AUTHENTICATION_REQUIRED);
		}

		await loginRequest(E2E_PASSWORD).expect(201);

		for (let attempt = 0; attempt < maxAttempts - 1; attempt++) {
			const response = await loginRequest("wrong-password").expect(401);
			expect(response.body.code).toBe(API_ERROR_CODES.AUTHENTICATION_REQUIRED);
		}

		const threshold = await loginRequest("wrong-password").expect(401);
		expect(threshold.body.code).toBe(API_ERROR_CODES.AUTH_ACCOUNT_LOCKED);
		const stillLocked = await loginRequest(E2E_PASSWORD).expect(401);
		expect(stillLocked.body.code).toBe(API_ERROR_CODES.AUTH_ACCOUNT_LOCKED);

		await app
			.get(DrizzleService)
			.db.update(users)
			.set({
				accountLockedUntil: new Date(Date.now() - 1_000).toISOString(),
			})
			.where(eq(users.email, username));
		const expired = await loginRequest("wrong-password").expect(401);
		expect(expired.body.code).toBe(API_ERROR_CODES.AUTHENTICATION_REQUIRED);
		await loginRequest(E2E_PASSWORD).expect(201);
	});

	it("keeps unknown and inactive account failures generic without locking them", async () => {
		const adminToken = await login(app, E2E_USERS.admin.email);
		const disabledEmail = "e2e.login.disabled@example.test";
		await request(app.getHttpServer())
			.post("/users")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				email: disabledEmail,
				password: E2E_PASSWORD,
				firstName: "Disabled",
				lastName: "Account",
				role: Role.AGENT_COMMERCIAL,
				type: "internal",
				isActive: false,
			})
			.expect(201);

		for (const username of ["missing-login@example.test", disabledEmail]) {
			for (let attempt = 0; attempt < 3; attempt++) {
				const response = await request(app.getHttpServer())
					.post("/auth/login")
					.send({ username, password: "wrong-password" })
					.expect(401);
				expect(response.body.code).toBe(
					API_ERROR_CODES.AUTHENTICATION_REQUIRED,
				);
			}
		}
	});

	it("persists appearance preferences per user and updates existing choices", async () => {
		const adminToken = await login(app, E2E_USERS.admin.email);
		const agentToken = await login(app, E2E_USERS.agentUnassigned.employeeCode);
		const adminPreferences = {
			theme: "mono-dark",
			fontFamily: "geist",
			textSize: "large",
			motion: "reduced",
			workspaceLayout: "centered-header",
		} satisfies AppearancePreferences;
		const updatedAdminPreferences = {
			theme: "dark",
			fontFamily: "system",
			textSize: "default",
			motion: "system",
			workspaceLayout: "sidebar",
		} satisfies AppearancePreferences;
		const agentPreferences = {
			theme: "mono-light",
			fontFamily: "geist",
			textSize: "small",
			motion: "reduced",
			workspaceLayout: "sidebar",
		} satisfies AppearancePreferences;
		const expectNoSavedPreferences = async (token: string) => {
			const response = await request(app.getHttpServer())
				.get("/profile/preferences")
				.set("Authorization", `Bearer ${token}`)
				.expect(200);
			expect(
				response.body == null ||
					(typeof response.body === "object" &&
						Object.keys(response.body).length === 0),
			).toBe(true);
		};

		await expectNoSavedPreferences(adminToken);

		await request(app.getHttpServer())
			.put("/profile/preferences")
			.set("Authorization", `Bearer ${adminToken}`)
			.send(adminPreferences)
			.expect(200)
			.expect(({ body }) => {
				expect(body).toMatchObject(adminPreferences);
				expect(body.updatedAt).toEqual(expect.any(String));
			});

		await expectNoSavedPreferences(agentToken);

		await request(app.getHttpServer())
			.put("/profile/preferences")
			.set("Authorization", `Bearer ${adminToken}`)
			.send(updatedAdminPreferences)
			.expect(200)
			.expect(({ body }) =>
				expect(body).toMatchObject(updatedAdminPreferences),
			);

		await request(app.getHttpServer())
			.put("/profile/preferences")
			.set("Authorization", `Bearer ${agentToken}`)
			.send(agentPreferences)
			.expect(200)
			.expect(({ body }) => expect(body).toMatchObject(agentPreferences));

		const [adminRead, agentRead] = await Promise.all([
			request(app.getHttpServer())
				.get("/profile/preferences")
				.set("Authorization", `Bearer ${adminToken}`)
				.expect(200),
			request(app.getHttpServer())
				.get("/profile/preferences")
				.set("Authorization", `Bearer ${agentToken}`)
				.expect(200),
		]);
		expect(adminRead.body).toMatchObject(updatedAdminPreferences);
		expect(agentRead.body).toMatchObject(agentPreferences);
	});

	it("requires verified customer identity and admin review before client sign-in", async () => {
		const approvedEmail = "e2e.registration.approved@example.test";
		const rejectedEmail = "e2e.registration.rejected@example.test";
		const registrationPassword = "E2e-registration!2026";
		const registration = (email: string) => ({
			email,
			password: registrationPassword,
			firstName: "Registration",
			lastName: "Applicant",
			customerCode: E2E_CUSTOMERS.assignedA,
			ice: E2E_CUSTOMER_ICE.assignedA,
		});

		const invalidIdentity = await request(app.getHttpServer())
			.post("/auth/register")
			.send({ ...registration(approvedEmail), ice: "999999999999999" })
			.expect(400);
		expect(invalidIdentity.body.code).toBe(
			API_ERROR_CODES.CUSTOMER_IDENTITY_INVALID,
		);

		const submitted = await request(app.getHttpServer())
			.post("/auth/register")
			.send(registration(approvedEmail))
			.expect(201);
		expect(submitted.body).toEqual({
			code: API_RESPONSE_CODES.REGISTRATION_SUBMITTED_FOR_REVIEW,
		});

		const duplicate = await request(app.getHttpServer())
			.post("/auth/register")
			.send(registration(approvedEmail))
			.expect(409);
		expect(duplicate.body.code).toBe(API_ERROR_CODES.USER_EMAIL_ALREADY_EXISTS);

		await request(app.getHttpServer())
			.post("/auth/register")
			.send(registration(rejectedEmail))
			.expect(201);

		await request(app.getHttpServer())
			.post("/auth/login")
			.send({ username: approvedEmail, password: registrationPassword })
			.expect(401);

		const adminToken = await login(app, E2E_USERS.admin.email);
		const usersResponse = await request(app.getHttpServer())
			.get("/users")
			.set("Authorization", `Bearer ${adminToken}`)
			.expect(200);
		const approvedApplicant = usersResponse.body.find(
			(user: { email: string }) => user.email === approvedEmail,
		);
		const rejectedApplicant = usersResponse.body.find(
			(user: { email: string }) => user.email === rejectedEmail,
		);
		expect(approvedApplicant?.registrationStatus).toBe(
			RegistrationStatus.PENDING,
		);
		expect(approvedApplicant?.isActive).toBe(false);
		expect(rejectedApplicant?.registrationStatus).toBe(
			RegistrationStatus.PENDING,
		);

		const approved = await request(app.getHttpServer())
			.put(`/users/${approvedApplicant.id}/registration-status`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ status: RegistrationStatus.APPROVED })
			.expect(200);
		expect(approved.body.registrationStatus).toBe(RegistrationStatus.APPROVED);
		expect(approved.body.isActive).toBe(true);

		const clientToken = await login(app, E2E_USERS.clientA.email);
		await request(app.getHttpServer())
			.put(`/users/${rejectedApplicant.id}/registration-status`)
			.set("Authorization", `Bearer ${clientToken}`)
			.send({ status: RegistrationStatus.APPROVED })
			.expect(403);

		const rejected = await request(app.getHttpServer())
			.put(`/users/${rejectedApplicant.id}/registration-status`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ status: RegistrationStatus.REJECTED })
			.expect(200);
		expect(rejected.body.registrationStatus).toBe(RegistrationStatus.REJECTED);
		expect(rejected.body.isActive).toBe(false);

		await request(app.getHttpServer())
			.post("/auth/login")
			.send({ username: approvedEmail, password: registrationPassword })
			.expect(201);
		await request(app.getHttpServer())
			.post("/auth/login")
			.send({ username: rejectedEmail, password: registrationPassword })
			.expect(401);

		const repeatReview = await request(app.getHttpServer())
			.put(`/users/${approvedApplicant.id}/registration-status`)
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ status: RegistrationStatus.REJECTED })
			.expect(409);
		expect(repeatReview.body.code).toBe(
			API_ERROR_CODES.ACCOUNT_REGISTRATION_NOT_PENDING,
		);
	});

	it("resets a password once, rejects expired tokens, and revokes active sessions", async () => {
		const email = E2E_USERS.passwordReset.email;
		const activeSession = await login(app, email);
		const newPasswords = [
			"E2e-reset-password!2026",
			"E2e-reset-password-alternate!2026",
		] as const;

		const expired = await request(app.getHttpServer())
			.post("/auth/reset-password")
			.send({
				token: E2E_PASSWORD_RESET.expired,
				newPassword: newPasswords[0],
			})
			.expect(400);
		expect(expired.body.code).toBe(API_ERROR_CODES.RESET_TOKEN_EXPIRED);

		const resetAttempts = await Promise.all(
			newPasswords.map((newPassword) =>
				request(app.getHttpServer())
					.post("/auth/reset-password")
					.send({ token: E2E_PASSWORD_RESET.valid, newPassword }),
			),
		);
		const successfulAttemptIndex = resetAttempts.findIndex(
			(attempt) => attempt.status === 201,
		);
		const failedAttempt = resetAttempts.find(
			(attempt) => attempt.status === 400,
		);
		expect(successfulAttemptIndex).not.toBe(-1);
		expect(
			resetAttempts.filter((attempt) => attempt.status === 201),
		).toHaveLength(1);
		expect(failedAttempt?.body.code).toBe(API_ERROR_CODES.RESET_TOKEN_INVALID);
		expect(resetAttempts[successfulAttemptIndex]?.body.code).toBe(
			API_RESPONSE_CODES.AUTH_PASSWORD_RESET,
		);
		const newPassword = newPasswords[successfulAttemptIndex];
		if (!newPassword) throw new Error("Expected one reset attempt to succeed.");

		await request(app.getHttpServer())
			.get("/profile")
			.set("Authorization", `Bearer ${activeSession}`)
			.expect(401);
		await request(app.getHttpServer())
			.post("/auth/login")
			.send({ username: email, password: E2E_PASSWORD })
			.expect(401);
		await request(app.getHttpServer())
			.post("/auth/login")
			.send({ username: email, password: newPassword })
			.expect(201);
		await request(app.getHttpServer())
			.post("/auth/login")
			.send({
				username: email,
				password: newPasswords[1 - successfulAttemptIndex],
			})
			.expect(401);

		const reused = await request(app.getHttpServer())
			.post("/auth/reset-password")
			.send({ token: E2E_PASSWORD_RESET.valid, newPassword })
			.expect(400);
		expect(reused.body.code).toBe(API_ERROR_CODES.RESET_TOKEN_INVALID);
	});

	it("changes a password and revokes every active session", async () => {
		const email = E2E_USERS.agentUnassigned.email;
		const firstSession = await login(app, email);
		const secondSession = await login(app, email);
		const newPassword = "E2e-change-password!2026";

		const changed = await request(app.getHttpServer())
			.post("/auth/change-password")
			.set("Authorization", `Bearer ${firstSession}`)
			.send({ currentPassword: E2E_PASSWORD, newPassword })
			.expect(201);
		expect(changed.body.code).toBe(API_RESPONSE_CODES.AUTH_PASSWORD_CHANGED);

		for (const session of [firstSession, secondSession]) {
			await request(app.getHttpServer())
				.get("/profile")
				.set("Authorization", `Bearer ${session}`)
				.expect(401);
		}
		await request(app.getHttpServer())
			.post("/auth/login")
			.send({ username: email, password: E2E_PASSWORD })
			.expect(401);
		await request(app.getHttpServer())
			.post("/auth/login")
			.send({ username: email, password: newPassword })
			.expect(201);

		const restorationSession = await login(app, email, newPassword);
		await request(app.getHttpServer())
			.post("/auth/change-password")
			.set("Authorization", `Bearer ${restorationSession}`)
			.send({ currentPassword: newPassword, newPassword: E2E_PASSWORD })
			.expect(201);
		await login(app, email);
	});

	afterAll(async () => {
		await app?.close();
	});
});
