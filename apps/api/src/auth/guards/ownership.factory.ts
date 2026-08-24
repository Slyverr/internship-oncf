import { Permission } from "@ecommand/shared";
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	PipeTransform,
	Type,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { AuthUser } from "src/auth/auth.types";
import { hasOnePermission } from "src/auth/auth.utils";
import { UserId } from "src/users/users.types";

export interface OwnershipGuardOptions<TService, TId> {
	service: Type<TService>;

	/**
	 * @deprecated Use canAccess instead.
	 */
	resolveOwnerId?: (service: TService, id: TId) => Promise<UserId>;

	canAccess?: (service: TService, id: TId, user: AuthUser) => Promise<boolean>;

	pipe: PipeTransform<string, TId>;
	permission?: Permission;
	errorMessage?: string;
	param?: string;
}

export function createOwnershipGuard<TService, TId>(
	options: OwnershipGuardOptions<TService, TId>,
): Type<CanActivate> {
	const {
		service,
		pipe,
		permission,
		errorMessage = "You can only access your own resources",
		param = "id",
		resolveOwnerId,
		canAccess,
	} = options;

	if (!canAccess && !resolveOwnerId) {
		throw new Error(
			"OwnershipGuard requires either canAccess or resolveOwnerId",
		);
	}

	@Injectable()
	class OwnershipGuard implements CanActivate {
		constructor(private readonly moduleRef: ModuleRef) {}

		async canActivate(context: ExecutionContext): Promise<boolean> {
			const request = context.switchToHttp().getRequest();
			const user = request.user as AuthUser;

			const rawId = request.params[param];
			if (!rawId) return true;
			if (permission && hasOnePermission(user, permission)) return true;

			const id = pipe.transform(rawId, { type: "param" });
			const serviceInstance = this.moduleRef.get(service, {
				strict: false,
			});

			const accessGranted = canAccess
				? await canAccess(serviceInstance, id, user)
				: (await resolveOwnerId!(serviceInstance, id)) === user.id;

			if (!accessGranted) {
				throw new ForbiddenException(errorMessage);
			}

			return true;
		}
	}

	return OwnershipGuard;
}
