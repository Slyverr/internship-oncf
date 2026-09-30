import { Permission, Role } from "@ecommand/shared";
import { hasOnePermission } from "@/auth/auth.utils";
import { getCustomerScope } from "@/auth/customer-scope";
import { createOwnershipGuard } from "@/auth/guards/ownership.factory";
import { ClaimsService } from "../claims.service";
import { ClaimNumber } from "../claims.types";
import { ClaimNumberPipe } from "../pipes/claim-number.pipe";

export const ClaimOwnershipGuard = createOwnershipGuard<
	ClaimsService,
	ClaimNumber
>({
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
	pipe: new ClaimNumberPipe(),
	errorMessage: "You can only access your own or assigned-customer claims",
});
