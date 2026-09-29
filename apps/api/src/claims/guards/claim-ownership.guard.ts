import { Permission } from "@ecommand/shared";
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

			const customerScope = getCustomerScope(user);
			return customerScope === null
				? claim.createdByUserId === user.id
				: customerScope.includes(claim.customerId);
		},
		pipe: new ClaimIdPipe(),
		permission: Permission.CLAIMS_MANAGE_OTHER,
		errorMessage: "You can only access your own or assigned-customer claims",
	},
);
