import {
	API_ERROR_CODES,
	ClaimStatus,
	NotificationMessageCode,
	Permission,
} from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { claims } from "drizzle/schema";
import { and, eq } from "drizzle-orm";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { getCustomerScope } from "@/auth/customer-scope";
import { CLAIM_STATUSES } from "@/database/reference-data";
import { NotificationsService } from "@/notifications/notifications.service";
import { CLAIM_STATUS_BY_ID, CLAIM_TRANSITION } from "./claims.constants";
import { ClaimsMapper } from "./claims.mapper";
import { ClaimsQuery } from "./claims.query";
import type { ClaimId, ClaimIdentifier, ClaimNumber } from "./claims.types";
import { CreateClaimDto } from "./requests/create-claim.dto";
import { ListClaimQueryDto } from "./requests/list-claim.dto";
import { UpdateClaimDto } from "./requests/update-claim.dto";

@Injectable()
export class ClaimsService {
	constructor(
		private readonly notifications: NotificationsService,
		private readonly claimsQuery: ClaimsQuery,
		private readonly claimsMapper: ClaimsMapper,
	) {}

	async create(dto: CreateClaimDto, user: AuthUser) {
		await this.ensureOrderCustomer(dto.customerId, dto.orderId);
		const values = this.claimsMapper.toCreate(dto, user);
		const created = await this.claimsQuery.createClaim(values);
		return this.findOne(created.id);
	}

	async findAll(user: AuthUser, query: ListClaimQueryDto) {
		const customerScope = getCustomerScope(user);
		const canReadOtherClaims = hasOnePermission(
			user,
			Permission.CLAIMS_MANAGE_OTHER,
		);

		if (customerScope === null && canReadOtherClaims) {
			return this.claimsQuery.findClaims(query);
		}

		if (customerScope !== null) {
			if (!canReadOtherClaims) query.userId = user.id;
			return this.claimsQuery.findClaims(query, customerScope);
		}

		query.userId = user.id;
		return this.claimsQuery.findClaims(query);
	}

	async findOne(identifier: ClaimIdentifier) {
		const claim =
			typeof identifier === "number"
				? await this.claimsQuery.findClaim(identifier)
				: await this.claimsQuery.findClaimByNumber(identifier);
		const found = this.ensure(claim);
		return found;
	}

	async findOneForOwnership(identifier: ClaimIdentifier) {
		const claim =
			typeof identifier === "number"
				? await this.claimsQuery.findClaimForOwnership(identifier)
				: await this.claimsQuery.findClaimForOwnershipByNumber(identifier);
		return this.ensure(claim);
	}

	async update(
		identifier: ClaimIdentifier,
		dto: UpdateClaimDto,
		user: AuthUser,
	) {
		const id = await this.resolveClaimId(identifier);
		const values = this.claimsMapper.toUpdate(dto, user);
		if (dto.customerId !== undefined || dto.orderId !== undefined) {
			const claim = this.ensure(
				await this.claimsQuery.findClaimAssociation(id),
			);
			await this.ensureOrderCustomer(
				dto.customerId ?? claim.customerId,
				dto.orderId ?? claim.orderId ?? undefined,
			);
		}
		await this.persistUpdate(id, values, {
			history: {
				userId: user.id,
			},
		});
		return this.findOne(id);
	}

	async remove(identifier: ClaimIdentifier) {
		const id = await this.resolveClaimId(identifier);
		const deleted = await this.claimsQuery.deleteClaim(id);
		return this.ensure(deleted);
	}

	async addComment(
		identifier: ClaimIdentifier,
		content: string,
		user: AuthUser,
	) {
		const claimId = await this.resolveClaimId(identifier);
		const claim = await this.findOneForOwnership(claimId);
		const startsProgress = hasOnePermission(
			user,
			Permission.CLAIMS_ACTION_START_PROGRESS,
		);
		const recipients = new Set<number>();
		if (claim.createdByUserId !== user.id) {
			recipients.add(claim.createdByUserId);
		}

		if (!hasOnePermission(user, Permission.CLAIMS_MANAGE_OTHER)) {
			for (const agentId of await this.claimsQuery.findClaimReadersForCustomer(
				claim.customerId,
			)) {
				if (agentId !== user.id) recipients.add(agentId);
			}
		}

		const notificationRecords = [...recipients].flatMap((recipientId) => {
			const record = this.notifications.createChangeRecord(
				recipientId,
				user.id,
				"claims",
				claimId,
				{
					code: NotificationMessageCode.CLAIM_COMMENT_ADDED,
					parameters: { recordCode: claim.claimNumber },
				},
			);
			return record ? [record] : [];
		});

		const comment = await this.claimsQuery.addClaimComment(
			claimId,
			content,
			user.id,
			{
				...(startsProgress && {
					statusTransition: {
						fromStatusId: CLAIM_STATUSES[ClaimStatus.NEW].id,
						toStatusId: CLAIM_STATUSES[ClaimStatus.IN_PROGRESS].id,
						changedByUserId: user.id,
					},
				}),
				notifications: notificationRecords,
			},
		);
		for (const notification of notificationRecords) {
			this.notifications.publishCreatedForUser(
				notification.recipientUserId,
				notification,
			);
		}
		const [created] = await this.getComments(claimId, comment.id);
		if (!created) {
			throw new NotFoundException({
				code: API_ERROR_CODES.CLAIM_COMMENT_NOT_FOUND,
			});
		}
		return created;
	}

	async getComments(identifier: ClaimIdentifier, commentId?: number) {
		const claimId = await this.resolveClaimId(identifier);
		const comments = await this.claimsQuery.findClaimComments(
			claimId,
			commentId,
		);
		return comments.map(({ authorUser, ...comment }) => ({
			...comment,
			authorName: authorUser
				? `${authorUser.firstName} ${authorUser.lastName}`
				: null,
		}));
	}

	async startProgress(identifier: ClaimIdentifier, user: AuthUser) {
		return this.transition(identifier, user.id, ClaimStatus.IN_PROGRESS);
	}

	async awaitInfo(identifier: ClaimIdentifier, user: AuthUser) {
		return this.transition(identifier, user.id, ClaimStatus.AWAITING_INFO);
	}

	async startTreatment(identifier: ClaimIdentifier, user: AuthUser) {
		return this.transition(identifier, user.id, ClaimStatus.IN_TREATMENT);
	}

	async resolve(
		identifier: ClaimIdentifier,
		user: AuthUser,
		resolution?: string,
	) {
		const claim = await this.findOne(identifier);
		if (!resolution && !claim.resolution) {
			throw new ConflictException({
				code: API_ERROR_CODES.CLAIM_RESOLUTION_REQUIRED,
			});
		}

		return this.transition(
			identifier,
			user.id,
			ClaimStatus.RESOLVED,
			resolution,
			resolution ? { resolution } : {},
		);
	}

	async close(identifier: ClaimIdentifier, user: AuthUser) {
		return this.transition(identifier, user.id, ClaimStatus.CLOSED, undefined, {
			closedByUserId: user.id,
			closedAt: new Date().toISOString(),
		});
	}

	async reject(
		identifier: ClaimIdentifier,
		user: AuthUser,
		rejectionReason?: string,
	) {
		return this.transition(
			identifier,
			user.id,
			ClaimStatus.REJECTED,
			rejectionReason,
		);
	}

	async sendToDtm(identifier: ClaimIdentifier, user: AuthUser) {
		return this.transition(identifier, user.id, ClaimStatus.SENT_TO_DTM);
	}

	private async persistUpdate(
		id: ClaimId,
		values: Parameters<ClaimsQuery["updateClaim"]>[1],
		options?: Parameters<ClaimsQuery["updateClaim"]>[2],
	) {
		const updated = await this.claimsQuery.updateClaim(id, values, options);
		if (!updated) {
			throw new ConflictException({
				code: API_ERROR_CODES.CLAIM_TRANSITION_INVALID,
			});
		}
		if (options?.notification) {
			this.notifications.publishCreatedForUser(
				options.notification.recipientUserId,
				options.notification,
			);
		}
		return updated;
	}

	private async ensureOrderCustomer(
		customerId: number,
		orderId?: number | null,
	) {
		if (orderId === undefined || orderId === null) return;

		const order = await this.claimsQuery.findOrderCustomer(orderId);
		if (!order || order.customerId !== customerId) {
			throw new BadRequestException({
				code: API_ERROR_CODES.CLAIM_ORDER_CUSTOMER_MISMATCH,
			});
		}
	}

	private async transition(
		identifier: ClaimIdentifier,
		userId: number,
		toStatus: ClaimStatus,
		comment?: string,
		extraValues: Record<string, unknown> = {},
	) {
		const claimId = await this.resolveClaimId(identifier);
		const claim = this.ensure(await this.claimsQuery.findClaimStatus(claimId));

		const fromStatus = CLAIM_STATUS_BY_ID[claim.statusId];
		if (!fromStatus) {
			throw new BadRequestException({
				code: API_ERROR_CODES.CLAIM_TRANSITION_INVALID,
			});
		}

		if (fromStatus === toStatus) {
			throw new ConflictException({
				code: API_ERROR_CODES.CLAIM_TRANSITION_INVALID,
			});
		}

		const allowed = CLAIM_TRANSITION[fromStatus] ?? [];
		if (!allowed.includes(toStatus)) {
			throw new ConflictException({
				code: API_ERROR_CODES.CLAIM_TRANSITION_INVALID,
			});
		}

		const notification = this.notifications.createChangeRecord(
			claim.createdByUserId,
			userId,
			"claims",
			claimId,
			{
				code: NotificationMessageCode.CLAIM_STATUS_CHANGED,
				parameters: { recordCode: claim.claimNumber, status: toStatus },
			},
		);

		await this.persistUpdate(
			claimId,
			{
				...extraValues,
				statusId: CLAIM_STATUSES[toStatus].id,
			},
			{
				where: and(eq(claims.id, claimId), eq(claims.statusId, claim.statusId)),
				history: {
					userId,
					comment,
				},
				notification,
			},
		);

		return this.findOne(claimId);
	}

	private async resolveClaimId(identifier: ClaimIdentifier): Promise<ClaimId> {
		if (typeof identifier === "number") return identifier;
		const claim = await this.claimsQuery.findClaimIdByNumber(
			identifier as ClaimNumber,
		);
		return this.ensure(claim).id;
	}

	private ensure<T>(value: T | undefined): T {
		if (!value) {
			throw new NotFoundException({
				code: API_ERROR_CODES.CLAIM_NOT_FOUND,
			});
		}
		return value;
	}
}
