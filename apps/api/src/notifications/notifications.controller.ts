import { Permission } from "@ecommand/shared";
import {
	Controller,
	Get,
	Param,
	Patch,
	Request,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiForbiddenResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { AuthRequest } from "src/auth/auth.types";
import { Permissions } from "src/auth/permissions.decorator";
import { MessageResponseDto } from "src/common/dto/message.response.dto";
import { NotificationResponseDto } from "./dto/notification.response.dto";
import { UnreadCountResponseDto } from "./dto/unread-count.response.dto";
import { NotificationOwnershipGuard } from "./guards/notification-ownership.guard";
import { NotificationsService } from "./notifications.service";
import type { NotificationId } from "./notifications.types";
import { NotificationIdPipe } from "./pipes/notification-id.pipe";

const NotificationIdParam = () => Param("id", NotificationIdPipe);

@Controller("notifications")
@UseGuards(NotificationOwnershipGuard)
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Get()
	@Permissions(Permission.TRACKING_READ)
	@ApiOkResponse({ type: [NotificationResponseDto] })
	@ApiUnauthorizedResponse()
	async findAll(@Request() req: AuthRequest) {
		return this.notificationsService.findAll(req.user);
	}

	@Get("unread-count")
	@Permissions(Permission.TRACKING_READ)
	@ApiOkResponse({ type: UnreadCountResponseDto })
	@ApiUnauthorizedResponse()
	async getUnreadCount(@Request() req: AuthRequest) {
		return this.notificationsService.getUnreadCount(req.user.id);
	}

	@Patch(":id/read")
	@Permissions(Permission.TRACKING_READ)
	@ApiOkResponse({ type: NotificationResponseDto })
	@ApiUnauthorizedResponse()
	@ApiBadRequestResponse()
	@ApiForbiddenResponse()
	@ApiNotFoundResponse()
	async markAsRead(
		@NotificationIdParam() id: NotificationId,
		@Request() req: AuthRequest,
	) {
		return this.notificationsService.markAsRead(id, req.user.id);
	}

	@Patch("read-all")
	@Permissions(Permission.TRACKING_READ)
	@ApiOkResponse({ type: MessageResponseDto })
	@ApiUnauthorizedResponse()
	async markAllAsRead(@Request() req: AuthRequest) {
		return this.notificationsService.markAllAsRead(req.user.id);
	}
}
