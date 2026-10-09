import { NotificationMessageCode } from "@ecommand/shared";
import { type AppLocale, Messages, translate } from "@/i18n";
import { translateNotificationMessage } from "@/i18n/notification-messages";
import { getNotificationHref } from "@/lib/notification-utils";
import type { RealtimeEventEnvelope } from "@/lib/realtime/realtime-events";

export type RealtimeToastPresentation = {
	type: "info" | "success" | "warning";
	title: string;
	description: string;
	href: string;
};

type ToastPresenter = (
	event: RealtimeEventEnvelope,
	locale: AppLocale,
) => RealtimeToastPresentation | null;

function stringRecord(value: unknown): Record<string, string> {
	if (typeof value !== "object" || value === null || Array.isArray(value))
		return {};
	return Object.fromEntries(
		Object.entries(value).filter(
			(entry): entry is [string, string] => typeof entry[1] === "string",
		),
	);
}

function presentNotification(
	event: RealtimeEventEnvelope,
	locale: AppLocale,
): RealtimeToastPresentation | null {
	if (event.data.change !== "created") return null;
	const notification = event.data.notification;
	if (typeof notification !== "object" || notification === null) {
		return {
			type: "info",
			title: translate(Messages.notifications.newNotificationTitle, {}, locale),
			description: translate(
				Messages.notifications.newNotificationDescription,
				{},
				locale,
			),
			href: "/dashboard/notifications",
		};
	}

	const details = notification as Record<string, unknown>;
	const messageParameters = stringRecord(details.messageParameters);
	const messageCode =
		typeof details.messageCode === "string"
			? (details.messageCode as NotificationMessageCode)
			: NotificationMessageCode.LEGACY_UPDATE;
	const message = translateNotificationMessage(
		{ messageCode, messageParameters },
		locale,
	);
	const href = getNotificationHref({
		relatedEntityType:
			typeof details.relatedEntityType === "string"
				? details.relatedEntityType
				: null,
		messageParameters,
	});

	return {
		type:
			messageCode === NotificationMessageCode.DTM_RESPONSE
				? messageParameters.status === "ACCEPTED"
					? "success"
					: "warning"
				: "info",
		title: message.title,
		description: message.body,
		href: href ?? "/dashboard/notifications",
	};
}

const realtimeToastPresenters: Record<string, ToastPresenter> = {
	"notifications.changed": presentNotification,
	"dtm.request.pending": (event, locale) => {
		const recordCode = event.data.relatedEntityCode;
		if (typeof recordCode !== "string") return null;
		return {
			type: "info",
			title: translate(Messages.dtmActivity.pendingToastTitle, {}, locale),
			description: translate(
				Messages.dtmActivity.pendingToastDescription,
				{ code: recordCode },
				locale,
			),
			href: "/dashboard/integrations/dtm",
		};
	},
};

export function getRealtimeToastPresentation(
	event: RealtimeEventEnvelope,
	locale: AppLocale,
): RealtimeToastPresentation | null {
	return realtimeToastPresenters[event.type]?.(event, locale) ?? null;
}
