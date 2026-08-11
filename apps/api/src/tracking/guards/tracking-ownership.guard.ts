import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { hasPermission } from "src/auth/auth.utils";
import { Permission } from "src/db/reference-data";
import { TrackingService } from "../tracking.service";

@Injectable()
export class TrackingOwnershipGuard implements CanActivate {
  constructor(private readonly trackingService: TrackingService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orderId = request.params.orderId;

    if (!orderId) return true;
    if (hasPermission(user, Permission.TRACKING_UPDATE)) return true;

    const order = await this.trackingService.findOrder(orderId);
    if (order.userId !== user.id) {
      throw new ForbiddenException("You can only track your own orders");
    }

    return true;
  }
}
