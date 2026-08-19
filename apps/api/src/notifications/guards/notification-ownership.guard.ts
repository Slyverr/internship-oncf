import { createOwnershipGuard } from "src/auth/guards/ownership.factory";
import { NotificationsService } from "../notifications.service";
import { NotificationId } from "../notifications.types";
import { NotificationIdPipe } from "../pipes/notification-id.pipe";

export const NotificationOwnershipGuard = createOwnershipGuard<
	NotificationsService,
	NotificationId
>({
	service: NotificationsService,
	resolveOwnerId: async (service, id) => {
		const owner = await service.findOne(id);
		return owner.userId;
	},

	pipe: new NotificationIdPipe(),
	errorMessage: "You can only access your own notifications",
});
