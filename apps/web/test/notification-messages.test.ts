import {
	ClaimStatus,
	DEFAULT_LOCALE,
	NotificationMessageCode,
	OrderStatus,
	ProgramStatus,
} from "@ecommand/shared";
import { translateNotificationMessage } from "../src/i18n/notification-messages";

const notifications = [
	{
		messageCode: NotificationMessageCode.ORDER_STATUS_CHANGED,
		messageParameters: {
			recordCode: "ORD-ABCDEFGHJK",
			status: OrderStatus.IN_PROGRESS,
		},
	},
	{
		messageCode: NotificationMessageCode.PROGRAM_STATUS_CHANGED,
		messageParameters: {
			recordCode: "PRG-ABCDEFGHJK",
			status: ProgramStatus.DRAFT,
		},
	},
	{
		messageCode: NotificationMessageCode.CLAIM_STATUS_CHANGED,
		messageParameters: {
			recordCode: "CLM-ABCDEFGHJK",
			status: ClaimStatus.NEW,
		},
	},
	{
		messageCode: NotificationMessageCode.CLAIM_COMMENT_ADDED,
		messageParameters: { recordCode: "CLM-ABCDEFGHJK" },
	},
	{
		messageCode: NotificationMessageCode.LEGACY_UPDATE,
		messageParameters: {},
	},
] as const;

const translated = notifications.map((notification) =>
	translateNotificationMessage(notification, DEFAULT_LOCALE),
);
for (const [index, message] of translated.entries()) {
	if (!message.title.trim() || !message.body.trim()) {
		throw new Error(
			`Notification ${notifications[index]?.messageCode} needs localized title and body copy.`,
		);
	}
}

if (translated[0]?.title !== "Order status updated") {
	throw new Error(
		`Unexpected order notification title: ${translated[0]?.title}`,
	);
}
if (translated[0]?.body !== "Order ORD-ABCDEFGHJK is now In progress.") {
	throw new Error(`Unexpected order notification body: ${translated[0]?.body}`);
}
if (translated[1]?.title !== "Program status updated") {
	throw new Error(
		`Unexpected program notification title: ${translated[1]?.title}`,
	);
}
if (translated[2]?.title !== "Claim status updated") {
	throw new Error(
		`Unexpected claim notification title: ${translated[2]?.title}`,
	);
}
if (
	translated[3]?.body !== "A new comment was added to claim CLM-ABCDEFGHJK."
) {
	throw new Error(
		`Unexpected comment notification body: ${translated[3]?.body}`,
	);
}
if (translated[4]?.title !== "Record updated") {
	throw new Error(
		`Unexpected legacy notification title: ${translated[4]?.title}`,
	);
}

const unknown = translateNotificationMessage(
	{
		messageCode: "FUTURE_CODE" as NotificationMessageCode,
		messageParameters: {},
	},
	DEFAULT_LOCALE,
);
if (
	unknown.title !== translated[4]?.title ||
	unknown.body !== translated[4]?.body
) {
	throw new Error(
		"Unknown notification codes should use the safe legacy fallback.",
	);
}

console.info("Localized notification content checks passed.");
