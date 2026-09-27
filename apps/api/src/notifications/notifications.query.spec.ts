import { NotificationChannel } from "@ecommand/shared";
import { NOTIFICATION_CHANNELS } from "@/database/reference-data";
import { NotificationsQuery } from "./notifications.query";

function parameterValues(value: unknown): unknown[] {
	if (!value || typeof value !== "object") return [];
	if ("queryChunks" in value && Array.isArray(value.queryChunks)) {
		return value.queryChunks.flatMap(parameterValues);
	}
	if (value.constructor?.name === "Param" && "value" in value) {
		return [value.value];
	}
	return [];
}

describe("NotificationsQuery recipient scope", () => {
	const findMany = jest.fn();
	const update = jest.fn();
	const query = new NotificationsQuery({
		db: { query: { notifications: { findMany } }, update },
	} as never);

	beforeEach(() => {
		findMany.mockReset();
		update.mockReset();
	});

	it("only lists sent in-app notifications for the requested recipient", async () => {
		findMany.mockResolvedValue([]);
		await query.findNotifications(31);
		expect(findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					recipientUserId: 31,
					channelId: NOTIFICATION_CHANNELS[NotificationChannel.IN_APP].id,
					status: "SENT",
				},
			}),
		);
	});

	it("scopes read updates by both notification and recipient IDs", async () => {
		const returning = jest.fn().mockResolvedValue([{ id: 7 }]);
		const where = jest.fn().mockReturnValue({ returning });
		const set = jest.fn().mockReturnValue({ where });
		update.mockReturnValue({ set });
		const result = await query.updateNotificationRead(7 as never, 31);
		expect(result).toEqual({ id: 7 });
		expect(parameterValues(where.mock.calls[0][0])).toEqual(
			expect.arrayContaining([7, 31]),
		);
	});

	it("counts only unread sent in-app notifications for the requested recipient", async () => {
		const where = jest.fn().mockResolvedValue([{ count: 3 }]);
		const from = jest.fn().mockReturnValue({ where });
		const select = jest.fn().mockReturnValue({ from });
		const scopedQuery = new NotificationsQuery({ db: { select } } as never);
		await expect(scopedQuery.findUnreadCount(31)).resolves.toBe(3);
		expect(parameterValues(where.mock.calls[0][0])).toEqual(
			expect.arrayContaining([
				31,
				"SENT",
				NOTIFICATION_CHANNELS[NotificationChannel.IN_APP].id,
			]),
		);
	});

	it("returns zero when the unread count query has no result", async () => {
		const where = jest.fn().mockResolvedValue([]);
		const from = jest.fn().mockReturnValue({ where });
		const select = jest.fn().mockReturnValue({ from });
		const scopedQuery = new NotificationsQuery({ db: { select } } as never);
		await expect(scopedQuery.findUnreadCount(31)).resolves.toBe(0);
	});
});
