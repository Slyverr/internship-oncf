import { API_ERROR_CODES, Permission } from "@ecommand/shared";
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { hasAllPermissions, hasAnyPermission } from "../auth.utils";
import {
	PERMISSIONS_ALL_KEY,
	PERMISSIONS_ANY_KEY,
} from "../permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const any = this.reflector.getAllAndOverride<Permission[]>(
			PERMISSIONS_ANY_KEY,
			[context.getHandler(), context.getClass()],
		);

		const all = this.reflector.getAllAndOverride<Permission[]>(
			PERMISSIONS_ALL_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!any && !all) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest<{
			user?: import("../auth.types").AuthUser;
		}>();

		if (!user) {
			throw new ForbiddenException({ code: API_ERROR_CODES.ACCESS_DENIED });
		}

		if (any && !hasAnyPermission(user, ...any))
			throw new ForbiddenException({ code: API_ERROR_CODES.ACCESS_DENIED });

		if (all && !hasAllPermissions(user, ...all))
			throw new ForbiddenException({ code: API_ERROR_CODES.ACCESS_DENIED });

		return true;
	}
}
