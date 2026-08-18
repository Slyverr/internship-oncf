import { Permission } from "@ecommand/shared";
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { hasAnyPermission } from "src/auth/auth.utils";
import { ClaimsService } from "../claims.service";
import { ClaimIdPipe } from "../pipes/claim-id.pipe";

@Injectable()
export class ClaimOwnershipGuard implements CanActivate {
	private readonly claimIdPipe = new ClaimIdPipe();

	constructor(private readonly claimsService: ClaimsService) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!request.params.id) {
			return true;
		}

		const id = this.claimIdPipe.transform(request.params.id);
		const claim = await this.claimsService.findOneForOwnership(id);

		if (
			claim.userId !== user.id &&
			!hasAnyPermission(user, Permission.CLAIMS_MANAGE)
		) {
			throw new ForbiddenException("You can only access your own claims");
		}

		return true;
	}
}
