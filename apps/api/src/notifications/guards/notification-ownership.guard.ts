import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { NotificationsService } from "../notifications.service";
import { NotificationIdPipe } from "../pipes/notification-id.pipe";

@Injectable()
export class NotificationOwnershipGuard implements CanActivate {
  private readonly notificationIdPipe = new NotificationIdPipe();

  constructor(private readonly notificationsService: NotificationsService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!request.params.id) return true;

    const id = this.notificationIdPipe.transform(request.params.id);
    const notification = await this.notificationsService.findOne(id);

    if (notification.userId !== user.id) {
      throw new ForbiddenException("You can only access your own notifications");
    }

    return true;
  }
}
