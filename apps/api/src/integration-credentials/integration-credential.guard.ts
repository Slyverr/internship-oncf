import { Permission } from "@ecommand/shared";
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { IntegrationCredentialsService } from "./integration-credentials.service";

@Injectable()
export class IntegrationCredentialGuard implements CanActivate {
	constructor(private readonly credentials: IntegrationCredentialsService) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<{
			headers: Record<string, string | string[] | undefined>;
			integrationCredential?: { id: number; permissions: string[] };
		}>();
		const header = request.headers.authorization;
		const token =
			typeof header === "string" ? header.replace(/^Bearer\s+/i, "") : "";
		if (!token || token === header) throw new UnauthorizedException();
		const credential = await this.credentials.authenticate(token);
		if (!credential.permissions.includes(Permission.TRACKING_UPDATE)) {
			throw new UnauthorizedException();
		}
		request.integrationCredential = {
			id: credential.id,
			permissions: credential.permissions,
		};
		return true;
	}
}
