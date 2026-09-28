import { ClaimStatus, Permission, Role } from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from "@nestjs/common";
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
	createdByUserId: 12,
	statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
	claimStatus: { name: ClaimStatus.NEW },
	resolution: null,
};

describe("ClaimsService workflows", () => {
	let service: ClaimsService;
	let query: jest.Mocked<ClaimsQuery>;
	let mapper: jest.Mocked<ClaimsMapper>;
	let notifications: { notifyChange: jest.Mock };

	beforeEach(() => {
		query = {
			findClaims: jest.fn(),
			findClaim: jest.fn(),
			findClaimForOwnership: jest.fn(),
			createClaim: jest.fn(),
			findOrderCustomer: jest.fn(),
			findClaimAssociation: jest.fn(),
			updateClaim: jest.fn(),
			deleteClaim: jest.fn(),
			addClaimComment: jest.fn(),
			findClaimComments: jest.fn(),
			findClaimStatus: jest.fn(),
		} as unknown as jest.Mocked<ClaimsQuery>;
		mapper = {
			toCreate: jest.fn(),
			toUpdate: jest.fn(),
		} as unknown as jest.Mocked<ClaimsMapper>;
		notifications = { notifyChange: jest.fn().mockResolvedValue(undefined) };
		service = new ClaimsService(notifications as never, query, mapper);
		query.updateClaim.mockResolvedValue({ id } as never);
		query.findClaim.mockResolvedValue(claim as never);
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

		await expect(service.create(dto as never, agent)).rejects.toThrow(
			new BadRequestException(
				"The associated order must belong to the selected customer.",
			),
		);
		expect(mapper.toCreate).not.toHaveBeenCalled();
		expect(query.createClaim).not.toHaveBeenCalled();
	});

	it("rejects a missing order association", async () => {
		const dto = { customerId: 42, orderId: 91, description: "Broken cargo" };
		query.findOrderCustomer.mockResolvedValue(undefined as never);

		await expect(service.create(dto as never, agent)).rejects.toThrow(
			new BadRequestException(
				"The associated order must belong to the selected customer.",
			),
		);
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
		).rejects.toThrow(
			new BadRequestException(
				"The associated order must belong to the selected customer.",
			),
		);
		expect(query.updateClaim).not.toHaveBeenCalled();
	});

	it("reports a missing claim for detail and ownership lookups", async () => {
		query.findClaim.mockResolvedValue(undefined);
		await expect(service.findOne(id)).rejects.toThrow(
			new NotFoundException("Claim 23 not found"),
		);
		query.findClaimForOwnership.mockResolvedValue(undefined);
		await expect(service.findOneForOwnership(id)).rejects.toThrow(
			new NotFoundException("Claim 23 not found"),
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
		).rejects.toThrow(
			new ConflictException("Claim 23 was modified or does not exist"),
		);
	});

	it("deletes an existing claim", async () => {
		query.deleteClaim.mockResolvedValue({ id } as never);
		expect(await service.remove(id)).toEqual({ id });
		expect(query.deleteClaim).toHaveBeenCalledWith(id);
	});

	it("reports a missing claim during deletion", async () => {
		query.deleteClaim.mockResolvedValue(undefined as never);
		await expect(service.remove(id)).rejects.toThrow(
			new NotFoundException("Claim 23 not found"),
		);
	});

	it("starts progress and notifies the claim creator", async () => {
		query.findClaimStatus.mockResolvedValue({
			statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
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
			}),
		);
		expect(notifications.notifyChange).toHaveBeenCalledWith(
			claim.createdByUserId,
			agent.id,
			"claims",
			id,
			"Claim #23 is now in progress.",
		);
	});

	it("rejects transitions for unknown or missing claims", async () => {
		query.findClaimStatus.mockResolvedValue({
			statusId: "unknown-status",
		} as never);
		await expect(service.startProgress(id, agent)).rejects.toThrow(
			new Error("Invalid status for claim 23"),
		);
		query.findClaimStatus.mockResolvedValue(undefined);
		await expect(service.startProgress(id, agent)).rejects.toThrow(
			new NotFoundException("Claim 23 not found"),
		);
	});

	it("rejects duplicate and disallowed transitions", async () => {
		query.findClaimStatus.mockResolvedValue({
			statusId: CLAIM_STATUSES[ClaimStatus.IN_PROGRESS].id,
		} as never);
		await expect(service.startProgress(id, agent)).rejects.toThrow(
			new ConflictException("Claim is already IN_PROGRESS"),
		);
		query.findClaimStatus.mockResolvedValue({
			statusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
		} as never);
		await expect(service.close(id, agent)).rejects.toThrow(
			new ConflictException("Cannot transition from NEW to CLOSED"),
		);
		expect(query.updateClaim).not.toHaveBeenCalled();
	});

	it("requires a resolution before resolving an unresolved claim", async () => {
		query.findClaim.mockResolvedValue({ ...claim, resolution: null } as never);
		await expect(service.resolve(id, agent)).rejects.toThrow(
			new ConflictException("Resolution required to resolve claim"),
		);
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
		} as never);

		expect(
			await service.addComment(id, "We are investigating", agent),
		).toMatchObject({ id: 88, authorName: "Ari Singh" });
		expect(query.addClaimComment).toHaveBeenCalledWith(
			id,
			"We are investigating",
			agent.id,
			expect.objectContaining({ statusTransition: expect.any(Object) }),
		);
		expect(notifications.notifyChange).toHaveBeenCalledWith(
			12,
			agent.id,
			"claims",
			id,
			"A new comment was added to claim #23.",
		);
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
		} as never);

		expect(
			await service.addComment(id, "Customer reply", customer),
		).toMatchObject({
			authorName: "Former user",
		});
		expect(query.addClaimComment).toHaveBeenCalledWith(
			id,
			"Customer reply",
			customer.id,
			{},
		);
	});

	it("reports when a newly added comment cannot be read back", async () => {
		query.addClaimComment.mockResolvedValue({ id: 90 } as never);
		query.findClaimComments.mockResolvedValue([]);
		await expect(service.addComment(id, "Reply", agent)).rejects.toThrow(
			new NotFoundException("Comment no longer exists"),
		);
		expect(query.findClaimForOwnership).not.toHaveBeenCalled();
	});
});
