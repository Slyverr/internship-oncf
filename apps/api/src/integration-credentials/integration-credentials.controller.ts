import { Permission } from "@ecommand/shared";
import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Request,
} from "@nestjs/common";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { IntegrationCredentialsService } from "./integration-credentials.service";
import { CreateIntegrationCredentialDto } from "./requests/create-integration-credential.dto";

@Controller("integration-credentials")
@RequireAny(Permission.INTEGRATIONS_MANAGE)
export class IntegrationCredentialsController {
	constructor(private readonly credentials: IntegrationCredentialsService) {}

	@Get()
	list() {
		return this.credentials.list();
	}

	@Post()
	create(
		@Body() dto: CreateIntegrationCredentialDto,
		@Request() req: AuthRequest,
	) {
		return this.credentials.create(dto.name, dto.permissions, req.user.id);
	}

	@Post(":id/rotate")
	rotate(@Param("id", ParseIntPipe) id: number, @Request() req: AuthRequest) {
		return this.credentials.rotate(id, req.user.id);
	}

	@Patch(":id/revoke")
	revoke(@Param("id", ParseIntPipe) id: number, @Request() req: AuthRequest) {
		return this.credentials.revoke(id, req.user.id);
	}
}
