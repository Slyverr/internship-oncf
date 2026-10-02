import {
	API_ERROR_CODES,
	ClaimStatus,
	NotificationChannel,
	NotificationMessageCode,
	NotificationType,
} from "@ecommand/shared";
import { NotificationsMapper } from "./notifications.mapper";
import { NotificationsQuery } from "./notifications.query";
import { NotificationsService } from "./notifications.service";

jest.mock("./notifications.query", () => ({ NotificationsQuery: class {} }));

describe("in-app notification delivery", () => {
	const mapper = new NotificationsMapper();
	const dto = {
		userId: 12,
		type: NotificationType.CLAIM_UPDATED,
		channel: NotificationChannel.IN_APP,
		messageCode: NotificationMessageCode.CLAIM_STATUS_CHANGED,
		messageParameters: {
			recordCode: "CLM-0123456789",
			status: ClaimStatus.RESOLVED,
		},
	};

	it("makes in-app messages readable immediately while email remains pending", () => {
		expect(mapper.toCreate(dto)).toMatchObject({
			status: "SENT",
			sentAt: expect.any(String),
		});
		expect(
			mapper.toCreate({ ...dto, channel: NotificationChannel.EMAIL }),
		).toMatchObject({ status: "PENDING", sentAt: null });
	});

	it("returns a numeric count object matching the API contract", async () => {
		const query = { findUnreadCount: jest.fn().mockResolvedValue("3") };
		const service = new NotificationsService(
			query as unknown as NotificationsQuery,
			mapper,
		);
		await expect(service.getUnreadCount(12)).resolves.toEqual({ count: 3 });
		expect(query.findUnreadCount).toHaveBeenCalledWith(12);
	});

	it("returns a stable code when a notification does not exist", async () => {
		const query = { findNotification: jest.fn().mockResolvedValue(undefined) };
		const service = new NotificationsService(
			query as unknown as NotificationsQuery,
			mapper,
		);
		await expect(service.findOne(23 as never)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.NOTIFICATION_NOT_FOUND },
		});
	});

	it("returns the same stable code when mark-as-read cannot find a notification", async () => {
		const query = {
			updateNotificationRead: jest.fn().mockResolvedValue(undefined),
		};
		const service = new NotificationsService(
			query as unknown as NotificationsQuery,
			mapper,
		);
		await expect(service.markAsRead(23 as never, 12)).rejects.toMatchObject({
			response: { code: API_ERROR_CODES.NOTIFICATION_NOT_FOUND },
		});
	});

	it("creates change records only for recipients other than the actor", () => {
		const service = new NotificationsService({} as NotificationsQuery, mapper);
		const content = {
			code: NotificationMessageCode.CLAIM_STATUS_CHANGED,
			parameters: {
				recordCode: "CLM-0123456789",
				status: ClaimStatus.RESOLVED,
			},
		} as const;
		expect(service.createChangeRecord(12, 12, "claims", 4, content)).toBe(
			undefined,
		);
		expect(
			service.createChangeRecord(12, 20, "claims", 4, content),
		).toMatchObject({
			recipientUserId: 12,
			relatedEntityType: "claims",
			relatedEntityId: 4,
			status: "SENT",
			messageCode: NotificationMessageCode.CLAIM_STATUS_CHANGED,
			messageParameters: content.parameters,
		});
	});

	it("does not expose legacy English notification text in the API response", async () => {
		const query = {
			findNotification: jest.fn().mockResolvedValue({
				id: 3,
				title: "Claim updated",
				message: "A new comment was added to claim CLM-0123456789.",
				messageCode: null,
				messageParameters: {},
				errorMessage: "SMTP provider rejected the recipient address",
			}),
		};
		const service = new NotificationsService(
			query as unknown as NotificationsQuery,
			mapper,
		);
		const result = await service.findOne(3 as never);
		expect(result).toMatchObject({
			messageCode: NotificationMessageCode.CLAIM_COMMENT_ADDED,
			messageParameters: { recordCode: "CLM-0123456789" },
		});
		expect(result).not.toHaveProperty("title");
		expect(result).not.toHaveProperty("message");
		expect(result).not.toHaveProperty("errorMessage");
	});
});
