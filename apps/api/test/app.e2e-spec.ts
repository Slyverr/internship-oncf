import {
	API_ERROR_CODES,
	API_RESPONSE_CODES,
	RegistrationStatus,
	Role,
} from "@ecommand/shared";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types";
import {
	E2E_CUSTOMER_ICE,
	E2E_CUSTOMERS,
	E2E_PASSWORD,
	E2E_PASSWORD_RESET,
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
	});

	afterAll(async () => {
		await app?.close();
	});
});
