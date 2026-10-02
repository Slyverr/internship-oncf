import {
	DEFAULT_LOCALE,
	NotificationMessageCode,
	OrderStatus,
} from "@ecommand/shared";
import { translateNotificationMessage } from "../src/i18n/notification-messages";

const statusUpdate = translateNotificationMessage(
	{
		messageCode: NotificationMessageCode.ORDER_STATUS_CHANGED,
		messageParameters: {
			recordCode: "ORD-ABCDEFGHJK",
			status: OrderStatus.IN_PROGRESS,
		},
	},
	DEFAULT_LOCALE,
);
if (statusUpdate.title !== "Order status updated") {
	throw new Error(
		`Unexpected status notification title: ${statusUpdate.title}`,
	);
}
if (statusUpdate.body !== "Order ORD-ABCDEFGHJK is now In progress.") {
	throw new Error(`Unexpected status notification body: ${statusUpdate.body}`);
}

const comment = translateNotificationMessage(
	{
		messageCode: NotificationMessageCode.CLAIM_COMMENT_ADDED,
		messageParameters: { recordCode: "CLM-ABCDEFGHJK" },
	},
	DEFAULT_LOCALE,
);
if (comment.body !== "A new comment was added to claim CLM-ABCDEFGHJK.") {
	throw new Error(`Unexpected comment notification body: ${comment.body}`);
}

const legacy = translateNotificationMessage(
	{
		messageCode: NotificationMessageCode.LEGACY_UPDATE,
		messageParameters: {},
	},
	DEFAULT_LOCALE,
);
if (legacy.title !== "Record updated") {
	throw new Error(`Unexpected legacy notification title: ${legacy.title}`);
}

console.info("Localized notification content checks passed.");
