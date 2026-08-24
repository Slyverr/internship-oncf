import { Permission } from "@ecommand/shared";
import { createOwnershipGuard } from "src/auth/guards/ownership.factory";
import { ClaimsService } from "../claims.service";
import { ClaimId } from "../claims.types";
import { ClaimIdPipe } from "../pipes/claim-id.pipe";

export const ClaimOwnershipGuard = createOwnershipGuard<ClaimsService, ClaimId>(
	{
		service: ClaimsService,
		resolveOwnerId: async (service, id) => {
			const claim = await service.findOneForOwnership(id);
			return claim.createdByUserId;
		},

		pipe: new ClaimIdPipe(),
		permission: Permission.CLAIMS_MANAGE_OTHER,
		errorMessage: "You can only access your own claims",
	},
);
