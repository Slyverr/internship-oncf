import {
	API_ERROR_CODES,
	CATALOG_MANAGEMENT_REQUIREMENTS,
	ManagedReferenceResource,
} from "@ecommand/shared";
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { AuthUser } from "@/auth/auth.types";
import { hasAllPermissions } from "@/auth/auth.utils";

@Injectable()
export class ManagedReferenceDataGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{
			params: { resource?: string };
			user?: AuthUser;
		}>();
		const resource = request.params.resource as ManagedReferenceResource;
		const required =
			CATALOG_MANAGEMENT_REQUIREMENTS[
				resource as keyof typeof CATALOG_MANAGEMENT_REQUIREMENTS
			];

		if (!required) {
			throw new NotFoundException({ code: API_ERROR_CODES.RESOURCE_NOT_FOUND });
		}
		if (!request.user || !hasAllPermissions(request.user, ...required)) {
			throw new ForbiddenException({ code: API_ERROR_CODES.ACCESS_DENIED });
		}
		return true;
	}
}
