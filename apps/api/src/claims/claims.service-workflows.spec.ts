import {
	API_ERROR_CODES,
	ClaimStatus,
	NotificationMessageCode,
	Permission,
	Role,
} from "@ecommand/shared";
import type { AuthUser } from "@/auth/auth.types";
import { CLAIM_STATUSES } from "@/database/reference-data";
import type { ClaimsMapper } from "./claims.mapper";
import type { ClaimsQuery } from "./claims.query";
import { ClaimsService } from "./claims.service";
import type { ClaimId } from "./claims.types";

const id = 23 as ClaimId;
const agent: AuthUser = {
	id: 7,
	email: "agent@example.test",
	role: Role.AGENT_COMMERCIAL,
	permissions: new Set([
		Permission.CLAIMS_READ,
		Permission.CLAIMS_UPDATE,
		Permission.CLAIMS_ACTION_START_PROGRESS,
	]),
	sessionId: "session-1",
	customerId: null,
	agencyId: null,
};
const claim = {
	id,
	claimNumber: "CLM-ABCDEFGHJK",
	createdByUserId: 12,
	statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
	claimStatus: { name: ClaimStatus.NEW },
	resolution: null,
};

describe("ClaimsService workflows", () => {
	let service: ClaimsService;
	let query: jest.Mocked<ClaimsQuery>;
	let mapper: jest.Mocked<ClaimsMapper>;
	let notifications: {
		notifyChange: jest.Mock;
		createChangeRecord: jest.Mock;
		publishCreatedForUser: jest.Mock;
	};

	beforeEach(() => {
		query = {
			findClaims: jest.fn(),
			findClaim: jest.fn(),
			findClaimByNumber: jest.fn(),
			findClaimForOwnership: jest.fn(),
			findClaimForOwnershipByNumber: jest.fn(),
			findClaimIdByNumber: jest.fn(),
			createClaim: jest.fn(),
			findOrderCustomer: jest.fn(),
			findClaimAssociation: jest.fn(),
			updateClaim: jest.fn(),
			deleteClaim: jest.fn(),
			addClaimComment: jest.fn(),
			findClaimComments: jest.fn(),
			findClaimStatus: jest.fn(),
			findClaimReadersForCustomer: jest.fn().mockResolvedValue([]),
		} as unknown as jest.Mocked<ClaimsQuery>;
		mapper = {
			toCreate: jest.fn(),
			toUpdate: jest.fn(),
		} as unknown as jest.Mocked<ClaimsMapper>;
		notifications = {
			notifyChange: jest.fn().mockResolvedValue(undefined),
			createChangeRecord: jest.fn().mockReturnValue({ id: "notification" }),
			publishCreatedForUser: jest.fn(),
		};
		service = new ClaimsService(notifications as never, query, mapper);
		query.updateClaim.mockResolvedValue({ id } as never);
		query.findClaim.mockResolvedValue(claim as never);
		query.findClaimByNumber.mockResolvedValue(claim as never);
		query.findClaimIdByNumber.mockResolvedValue({ id } as never);
	});

	it("maps and creates a claim, then returns its detail", async () => {
		const values = { description: "Broken cargo" };
		mapper.toCreate.mockReturnValue(values as never);
		query.createClaim.mockResolvedValue({ id } as never);
		expect(await service.create(values as never, agent)).toEqual(claim);
		expect(mapper.toCreate).toHaveBeenCalledWith(values, agent);
		expect(query.createClaim).toHaveBeenCalledWith(values);
		expect(query.findClaim).toHaveBeenCalledWith(id);
	});

	it("allows an association with the same customer", async () => {
		const dto = { customerId: 42, orderId: 91, description: "Broken cargo" };
		const values = { ...dto };
		query.findOrderCustomer.mockResolvedValue({ customerId: 42 } as never);
		mapper.toCreate.mockReturnValue(values as never);
		query.createClaim.mockResolvedValue({ id } as never);

		await service.create(dto as never, agent);

		expect(query.findOrderCustomer).toHaveBeenCalledWith(91);
		expect(query.createClaim).toHaveBeenCalledWith(values);
	});

	it("rejects an order association from another customer", async () => {
		const dto = { customerId: 42, orderId: 91, description: "Broken cargo" };
		query.findOrderCustomer.mockResolvedValue({ customerId: 43 } as never);

		await expect(service.create(dto as never, agent)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_ORDER_CUSTOMER_MISMATCH },
		});
		expect(mapper.toCreate).not.toHaveBeenCalled();
		expect(query.createClaim).not.toHaveBeenCalled();
	});

	it("rejects a missing order association", async () => {
		const dto = { customerId: 42, orderId: 91, description: "Broken cargo" };
		query.findOrderCustomer.mockResolvedValue(undefined as never);

		await expect(service.create(dto as never, agent)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_ORDER_CUSTOMER_MISMATCH },
		});
		expect(query.createClaim).not.toHaveBeenCalled();
	});

	it("rejects updates that mismatch an existing order and new customer", async () => {
		query.findClaimAssociation.mockResolvedValue({
			customerId: 42,
			orderId: 91,
		} as never);
		query.findOrderCustomer.mockResolvedValue({ customerId: 42 } as never);

		await expect(
			service.update(id, { customerId: 43 } as never, {
				...agent,
				permissions: new Set([
					Permission.CLAIMS_READ,
					Permission.CLAIMS_UPDATE,
					Permission.CLAIMS_MANAGE_OTHER,
				]),
			}),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_ORDER_CUSTOMER_MISMATCH },
		});
		expect(query.updateClaim).not.toHaveBeenCalled();
	});

	it("reports a missing claim for detail and ownership lookups", async () => {
		query.findClaim.mockResolvedValue(undefined);
		await expect(service.findOne(id)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_NOT_FOUND },
		});
		query.findClaimForOwnership.mockResolvedValue(undefined);
		await expect(service.findOneForOwnership(id)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_NOT_FOUND },
		});
	});

	it("resolves a public claim number for detail lookups", async () => {
		query.findClaimByNumber.mockResolvedValue(claim as never);

		await expect(service.findOne(claim.claimNumber)).resolves.toEqual(claim);
		expect(query.findClaimByNumber).toHaveBeenCalledWith(claim.claimNumber);
	});

	it("resolves a public claim number before persisting a workflow change", async () => {
		query.findClaimIdByNumber.mockResolvedValue({ id } as never);
		query.findClaimStatus.mockResolvedValue({
			statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
			claimNumber: claim.claimNumber,
			createdByUserId: claim.createdByUserId,
		} as never);

		await service.startProgress(claim.claimNumber, agent);

		expect(query.findClaimIdByNumber).toHaveBeenCalledWith(claim.claimNumber);
		expect(query.updateClaim).toHaveBeenCalledWith(
			id,
			expect.objectContaining({
				statusId: CLAIM_STATUSES[ClaimStatus.IN_PROGRESS].id,
			}),
			expect.any(Object),
		);
	});

	it("maps and persists claim updates", async () => {
		const dto = { description: "Updated description" };
		const values = { description: "Updated description" };
		mapper.toUpdate.mockReturnValue(values as never);
		expect(await service.update(id, dto, agent)).toEqual(claim);
		expect(query.updateClaim).toHaveBeenCalledWith(
			id,
			values,
			expect.objectContaining({ history: { userId: agent.id } }),
		);
	});

	it("reports an optimistic update conflict", async () => {
		mapper.toUpdate.mockReturnValue({ description: "updated" } as never);
		query.updateClaim.mockResolvedValue(undefined as never);
		await expect(
			service.update(id, { description: "updated" }, agent),
		).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_TRANSITION_INVALID },
		});
	});

	it("deletes an existing claim", async () => {
		query.deleteClaim.mockResolvedValue({ id } as never);
		expect(await service.remove(id)).toEqual({ id });
		expect(query.deleteClaim).toHaveBeenCalledWith(id);
	});

	it("reports a missing claim during deletion", async () => {
		query.deleteClaim.mockResolvedValue(undefined as never);
		await expect(service.remove(id)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_NOT_FOUND },
		});
	});

	it("starts progress and notifies the claim creator", async () => {
		query.findClaimStatus.mockResolvedValue({
			statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
			claimNumber: claim.claimNumber,
			createdByUserId: claim.createdByUserId,
		} as never);
		query.findClaim.mockResolvedValue({
			...claim,
			claimStatus: { name: ClaimStatus.IN_PROGRESS },
		} as never);

		await service.startProgress(id, agent);

		expect(query.updateClaim).toHaveBeenCalledWith(
			id,
			{ statusId: CLAIM_STATUSES[ClaimStatus.IN_PROGRESS].id },
			expect.objectContaining({
				history: { userId: agent.id, comment: undefined },
				notification: { id: "notification" },
			}),
		);
		expect(notifications.createChangeRecord).toHaveBeenCalledWith(
			claim.createdByUserId,
			agent.id,
			"claims",
			id,
			{
				code: NotificationMessageCode.CLAIM_STATUS_CHANGED,
				parameters: {
					recordCode: claim.claimNumber,
					status: ClaimStatus.IN_PROGRESS,
				},
			},
		);
	});

	it("rejects transitions for unknown or missing claims", async () => {
		query.findClaimStatus.mockResolvedValue({
			statusId: "unknown-status",
		} as never);
		await expect(service.startProgress(id, agent)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_TRANSITION_INVALID },
		});
		query.findClaimStatus.mockResolvedValue(undefined);
		await expect(service.startProgress(id, agent)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_NOT_FOUND },
		});
	});

	it("rejects duplicate and disallowed transitions", async () => {
		query.findClaimStatus.mockResolvedValue({
			statusId: CLAIM_STATUSES[ClaimStatus.IN_PROGRESS].id,
		} as never);
		await expect(service.startProgress(id, agent)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_TRANSITION_INVALID },
		});
		query.findClaimStatus.mockResolvedValue({
			statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
		} as never);
		await expect(service.close(id, agent)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_TRANSITION_INVALID },
		});
		expect(query.updateClaim).not.toHaveBeenCalled();
	});

	it("allows an in-progress claim to be rejected with its reason", async () => {
		query.findClaimStatus.mockResolvedValue({
			statusId: CLAIM_STATUSES[ClaimStatus.IN_PROGRESS].id,
			claimNumber: claim.claimNumber,
			createdByUserId: claim.createdByUserId,
		} as never);

		await service.reject(id, agent, "The reported damage was not confirmed");

		expect(query.updateClaim).toHaveBeenCalledWith(
			id,
			{ statusId: CLAIM_STATUSES[ClaimStatus.REJECTED].id },
			expect.objectContaining({
				history: {
					userId: agent.id,
					comment: "The reported damage was not confirmed",
				},
			}),
		);
	});

	it("requires a resolution before resolving an unresolved claim", async () => {
		query.findClaim.mockResolvedValue({ ...claim, resolution: null } as never);
		await expect(service.resolve(id, agent)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_RESOLUTION_REQUIRED },
		});
		expect(query.updateClaim).not.toHaveBeenCalled();
	});

	it("stores a new resolution with the resolved transition", async () => {
		query.findClaim.mockResolvedValue({ ...claim, resolution: null } as never);
		query.findClaimStatus.mockResolvedValue({
			statusId: CLAIM_STATUSES[ClaimStatus.IN_TREATMENT].id,
		} as never);
		await service.resolve(id, agent, "Repaired and returned");
		expect(query.updateClaim).toHaveBeenCalledWith(
			id,
			{
				resolution: "Repaired and returned",
				statusId: CLAIM_STATUSES[ClaimStatus.RESOLVED].id,
			},
			expect.any(Object),
		);
	});

	it("records who closed a resolved claim", async () => {
		query.findClaimStatus.mockResolvedValue({
			statusId: CLAIM_STATUSES[ClaimStatus.RESOLVED].id,
		} as never);
		await service.close(id, agent);
		const [, values] = query.updateClaim.mock.calls[0];
		expect(values).toMatchObject({
			closedByUserId: agent.id,
			statusId: CLAIM_STATUSES[ClaimStatus.CLOSED].id,
		});
		expect(values.closedAt).toEqual(expect.any(String));
	});

	it("adds a comment and starts progress when the author has that permission", async () => {
		query.addClaimComment.mockResolvedValue({ id: 88 } as never);
		query.findClaimComments.mockResolvedValue([
			{
				id: 88,
				content: "We are investigating",
				authorUser: { firstName: "Ari", lastName: "Singh" },
			},
		] as never);
		query.findClaimForOwnership.mockResolvedValue({
			createdByUserId: 12,
			claimNumber: claim.claimNumber,
			customerId: 42,
		} as never);

		expect(
			await service.addComment(id, "We are investigating", agent),
		).toMatchObject({ id: 88, authorName: "Ari Singh" });
		const [, , , options] = query.addClaimComment.mock.calls[0];
		expect(options?.statusTransition).toMatchObject({
			fromStatusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
			toStatusId: CLAIM_STATUSES[ClaimStatus.IN_PROGRESS].id,
			changedByUserId: agent.id,
		});
		expect(options?.statusTransition).not.toHaveProperty("comment");
		expect(notifications.createChangeRecord).toHaveBeenCalledWith(
			12,
			agent.id,
			"claims",
			id,
			{
				code: NotificationMessageCode.CLAIM_COMMENT_ADDED,
				parameters: { recordCode: claim.claimNumber },
			},
		);
		expect(query.addClaimComment.mock.calls[0][3]?.notifications).toEqual([
			{ id: "notification" },
		]);
	});

	it("does not start progress for a commenter without transition permission", async () => {
		const customer = {
			...agent,
			permissions: new Set([Permission.CLAIMS_READ]),
		};
		query.addClaimComment.mockResolvedValue({ id: 89 } as never);
		query.findClaimComments.mockResolvedValue([
			{ id: 89, authorUser: null },
		] as never);
		query.findClaimForOwnership.mockResolvedValue({
			createdByUserId: 12,
			claimNumber: claim.claimNumber,
			customerId: 42,
		} as never);

		expect(
			await service.addComment(id, "Customer reply", customer),
		).toMatchObject({
			authorName: null,
		});
		expect(query.addClaimComment).toHaveBeenCalledWith(
			id,
			"Customer reply",
			customer.id,
			{ notifications: [{ id: "notification" }] },
		);
	});

	it("notifies the shared agent queue when a client replies to their claim", async () => {
		const client: AuthUser = {
			id: 12,
			email: "client@example.test",
			role: Role.CLIENT_REPRESENTATIVE,
			permissions: new Set([
				Permission.CLAIMS_READ,
				Permission.CLAIMS_ACTION_COMMENT,
			]),
			sessionId: "client-session",
			customerId: 42,
			agencyId: null,
		};
		query.addClaimComment.mockResolvedValue({ id: 91 } as never);
		query.findClaimComments.mockResolvedValue([
			{ id: 91, authorUser: { firstName: "Client", lastName: "Rep" } },
		] as never);
		query.findClaimForOwnership.mockResolvedValue({
			createdByUserId: client.id,
			claimNumber: claim.claimNumber,
			customerId: 42,
		} as never);
		query.findClaimReadersForCustomer.mockResolvedValue([7, 8]);

		await service.addComment(id, "Please provide an update", client);

		expect(notifications.createChangeRecord).toHaveBeenCalledTimes(2);
		for (const agentId of [7, 8]) {
			expect(notifications.createChangeRecord).toHaveBeenCalledWith(
				agentId,
				client.id,
				"claims",
				id,
				{
					code: NotificationMessageCode.CLAIM_COMMENT_ADDED,
					parameters: { recordCode: claim.claimNumber },
				},
			);
		}
		expect(query.addClaimComment.mock.calls[0][3]?.notifications).toEqual([
			{ id: "notification" },
			{ id: "notification" },
		]);
	});

	it("does not save a comment when its notification recipients cannot be resolved", async () => {
		const recipientLookupError = new Error("Database unavailable");
		query.findClaimForOwnership.mockResolvedValue({
			createdByUserId: 12,
			claimNumber: claim.claimNumber,
			customerId: 42,
		} as never);
		query.findClaimReadersForCustomer.mockRejectedValue(recipientLookupError);

		await expect(
			service.addComment(id, "Please provide an update", agent),
		).rejects.toBe(recipientLookupError);

		expect(notifications.createChangeRecord).not.toHaveBeenCalled();
		expect(query.addClaimComment).not.toHaveBeenCalled();
	});

	it("reports when a newly added comment cannot be read back", async () => {
		query.addClaimComment.mockResolvedValue({ id: 90 } as never);
		query.findClaimComments.mockResolvedValue([]);
		query.findClaimForOwnership.mockResolvedValue({
			createdByUserId: 12,
			claimNumber: claim.claimNumber,
			customerId: 42,
		} as never);
		await expect(service.addComment(id, "Reply", agent)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.CLAIM_COMMENT_NOT_FOUND },
		});
		expect(query.findClaimForOwnership).toHaveBeenCalledWith(id);
	});
});
