import { NotificationChannel, NotificationType } from "@ecommand/shared";
import { Logger } from "@nestjs/common";
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
		title: "Claim updated",
		message: "Your claim was resolved.",
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

	it("notifies the resource owner only when another user acts", async () => {
		const query = {
			createNotification: jest.fn().mockResolvedValue({ id: 1 }),
			findNotification: jest.fn().mockResolvedValue({ id: 1 }),
		};
		const service = new NotificationsService(
			query as unknown as NotificationsQuery,
			mapper,
		);
		await service.notifyChange(12, 12, "claims", 4, "Changed");
		expect(query.createNotification).not.toHaveBeenCalled();
		await service.notifyChange(12, 20, "claims", 4, "Changed");
		expect(query.createNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				recipientUserId: 12,
				relatedEntityType: "claims",
				relatedEntityId: 4,
				status: "SENT",
			}),
		);
	});

	it("does not turn a saved workflow into a failed response when notification storage fails", async () => {
		const log = jest
			.spyOn(Logger.prototype, "error")
			.mockImplementation(() => undefined);
		try {
			const query = {
				createNotification: jest
					.fn()
					.mockRejectedValue(new Error("unavailable")),
			};
			const service = new NotificationsService(
				query as unknown as NotificationsQuery,
				mapper,
			);
			await expect(
				service.notifyChange(12, 20, "orders", 4, "Changed"),
			).resolves.toBeUndefined();
			expect(log).toHaveBeenCalled();
		} finally {
			log.mockRestore();
		}
	});
});
