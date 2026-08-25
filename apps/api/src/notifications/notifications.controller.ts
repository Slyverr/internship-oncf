import {
	Controller,
	Get,
	Param,
	Patch,
	Request,
	UseGuards,
} from "@nestjs/common";
import { ApiOkResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import type { AuthRequest } from "@/auth/auth.types";
import { createCrudResponses } from "@/common/decorators/api-crud-responses.decorator";
import { MessageResponseDto } from "@/common/responses/message.dto";
import { NotificationOwnershipGuard } from "./guards/notification-ownership.guard";
import { NotificationsService } from "./notifications.service";
import type { NotificationId } from "./notifications.types";
import { NotificationIdPipe } from "./pipes/notification-id.pipe";
import { NotificationDetailDto } from "./responses/notification-detail.dto";
import { NotificationListDto } from "./responses/notification-list.dto";
import { NotificationUnreadCountDto } from "./responses/notification-unread-count.dto";

const NotificationIdParam = () => Param("id", NotificationIdPipe);

const { list: NotificationListResponse, detail: NotificationDetailResponse } =
	createCrudResponses({
		list: NotificationListDto,
		detail: NotificationDetailDto,
	});

@Controller("notifications")
@UseGuards(NotificationOwnershipGuard)
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Get()
	@NotificationListResponse()
	async findAll(@Request() req: AuthRequest) {
		return this.notificationsService.findAll(req.user);
	}

	@Get("unread-count")
	@ApiOkResponse({ type: NotificationUnreadCountDto })
	@ApiUnauthorizedResponse()
	async getUnreadCount(@Request() req: AuthRequest) {
		return this.notificationsService.getUnreadCount(req.user.id);
	}

	@Patch(":id/read")
	@NotificationDetailResponse()
	async markAsRead(
		@NotificationIdParam() id: NotificationId,
		@Request() req: AuthRequest,
	) {
		return this.notificationsService.markAsRead(id, req.user.id);
	}

	@Patch("read-all")
	@ApiOkResponse({ type: MessageResponseDto })
	@ApiUnauthorizedResponse()
	async markAllAsRead(@Request() req: AuthRequest) {
		return this.notificationsService.markAllAsRead(req.user.id);
	}
}
