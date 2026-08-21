import { notifications } from "drizzle/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { NotificationsService } from "./notifications.service";

export type Notification = InferSelectModel<typeof notifications>;
export type NotificationInsert = InferInsertModel<typeof notifications>;
export type NotificationUpdate = Partial<NotificationInsert>;

export type NotificationId = Notification["id"];

export type NotificationList = Awaited<
	ReturnType<NotificationsService["findAll"]>
>[number];

export type NotificationDetail = NonNullable<
	Awaited<ReturnType<NotificationsService["findOne"]>>
>;
