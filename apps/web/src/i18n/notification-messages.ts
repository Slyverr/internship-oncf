import { NotificationMessageCode } from "@ecommand/shared";
import type { NotificationListDto } from "@/lib/api/generated.schemas";
import { type AppLocale, Messages, translate } from ".";
import {
	getClaimNotificationStatusLabel,
	getOrderNotificationStatusLabel,
	getProgramNotificationStatusLabel,
} from "./status-labels";

export function translateNotificationMessage(
	notification: Pick<NotificationListDto, "messageCode" | "messageParameters">,
	locale: AppLocale,
) {
	const parameters = notification.messageParameters ?? {};
	const recordCode = parameters.recordCode ?? "";

	switch (notification.messageCode) {
		case NotificationMessageCode.ORDER_STATUS_CHANGED:
			return {
				title: translate(
					Messages.notifications.messages.orderStatusChanged.title,
					{},
					locale,
				),
				body: translate(
					Messages.notifications.messages.orderStatusChanged.body,
					{
						recordCode,
						status: getOrderNotificationStatusLabel(parameters.status, locale),
					},
					locale,
				),
			};
		case NotificationMessageCode.PROGRAM_STATUS_CHANGED:
			return {
				title: translate(
					Messages.notifications.messages.programStatusChanged.title,
					{},
					locale,
				),
				body: translate(
					Messages.notifications.messages.programStatusChanged.body,
					{
						recordCode,
						status: getProgramNotificationStatusLabel(
							parameters.status,
							locale,
						),
					},
					locale,
				),
			};
		case NotificationMessageCode.CLAIM_STATUS_CHANGED:
			return {
				title: translate(
					Messages.notifications.messages.claimStatusChanged.title,
					{},
					locale,
				),
				body: translate(
					Messages.notifications.messages.claimStatusChanged.body,
					{
						recordCode,
						status: getClaimNotificationStatusLabel(parameters.status, locale),
					},
					locale,
				),
			};
		case NotificationMessageCode.CLAIM_COMMENT_ADDED:
			return {
				title: translate(
					Messages.notifications.messages.claimCommentAdded.title,
					{},
					locale,
				),
				body: translate(
					Messages.notifications.messages.claimCommentAdded.body,
					{
						recordCode,
					},
					locale,
				),
			};
		default:
			return {
				title: translate(
					Messages.notifications.messages.legacyUpdate.title,
					{},
					locale,
				),
				body: translate(
					Messages.notifications.messages.legacyUpdate.body,
					{},
					locale,
				),
			};
	}
}
