import { notifications } from "drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

export type Notification = InferSelectModel<typeof notifications>;
export type NotificationId = Notification["id"];
