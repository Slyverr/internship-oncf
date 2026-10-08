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
import { ApiOkResponse } from "@nestjs/swagger";
import type { AuthRequest } from "@/auth/auth.types";
import { RequireAny } from "@/auth/permissions.decorator";
import { IntegrationCredentialsService } from "./integration-credentials.service";
import { CreateIntegrationCredentialDto } from "./requests/create-integration-credential.dto";
import {
	CreatedIntegrationCredentialDto,
	IntegrationCredentialDto,
	RevokedIntegrationCredentialDto,
} from "./responses/integration-credential.dto";

@Controller("integration-credentials")
@RequireAny(Permission.INTEGRATIONS_MANAGE)
export class IntegrationCredentialsController {
	constructor(private readonly credentials: IntegrationCredentialsService) {}

	@Get()
	@ApiOkResponse({ type: [IntegrationCredentialDto] })
	list() {
		return this.credentials.list();
	}

	@Post()
	@ApiOkResponse({ type: CreatedIntegrationCredentialDto })
	create(
		@Body() dto: CreateIntegrationCredentialDto,
		@Request() req: AuthRequest,
	) {
		return this.credentials.create(dto.name, dto.permissions, req.user.id);
	}

	@Post(":id/rotate")
	@ApiOkResponse({ type: CreatedIntegrationCredentialDto })
	rotate(@Param("id", ParseIntPipe) id: number, @Request() req: AuthRequest) {
		return this.credentials.rotate(id, req.user.id);
	}

	@Patch(":id/revoke")
	@ApiOkResponse({ type: RevokedIntegrationCredentialDto })
	revoke(@Param("id", ParseIntPipe) id: number, @Request() req: AuthRequest) {
		return this.credentials.revoke(id, req.user.id);
	}
}
