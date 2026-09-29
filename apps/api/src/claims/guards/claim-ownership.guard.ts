import { Permission, Role } from "@ecommand/shared";
import { hasOnePermission } from "@/auth/auth.utils";
import { getCustomerScope } from "@/auth/customer-scope";
import { createOwnershipGuard } from "@/auth/guards/ownership.factory";
import { ClaimsService } from "../claims.service";
import { ClaimId } from "../claims.types";
import { ClaimIdPipe } from "../pipes/claim-id.pipe";

export const ClaimOwnershipGuard = createOwnershipGuard<ClaimsService, ClaimId>(
	{
		service: ClaimsService,
		canAccess: async (service, id, user) => {
			const claim = await service.findOneForOwnership(id);
			if (!claim) return undefined;

			if (user.role === Role.AGENT_COMMERCIAL) {
				return (getCustomerScope(user) ?? []).includes(claim.customerId);
			}

			return (
				hasOnePermission(user, Permission.CLAIMS_MANAGE_OTHER) ||
				claim.createdByUserId === user.id
			);
		},
		pipe: new ClaimIdPipe(),
		errorMessage: "You can only access your own or assigned-customer claims",
	},
);
