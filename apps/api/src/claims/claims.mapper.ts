import { ClaimStatus, Permission } from "@ecommand/shared";
import { ForbiddenException } from "@nestjs/common";
import { AuthUser } from "src/auth/auth.types";
import { hasPermission } from "src/auth/auth.utils";
import { CLAIM_STATUSES, CLAIM_TYPES } from "src/db/reference-data";
import { ClaimInsert, ClaimUpdate } from "./claims.types";
import { CreateClaimDto } from "./requests/create-claim.dto";
import { UpdateClaimDto } from "./requests/update-claim.dto";

export const toCreate = (dto: CreateClaimDto, user: AuthUser): ClaimInsert => {
	const userId = dto.userId ?? user.id;

	if (!hasPermission(user, Permission.CLAIMS_CREATE) && userId !== user.id) {
		throw new ForbiddenException("Cannot create claims for other users");
	}

	const status = hasPermission(user, Permission.CLAIMS_UPDATE)
		? (dto.status ?? ClaimStatus.NEW)
		: ClaimStatus.NEW;

	return {
		...dto,
		userId,
		typeId: CLAIM_TYPES[dto.type].id,
		statusId: CLAIM_STATUSES[status].id,
	};
};

export const toUpdate = (dto: UpdateClaimDto, user: AuthUser): ClaimUpdate => {
	const result: ClaimUpdate = { ...dto };

	if (dto.userId !== undefined && dto.userId !== user.id) {
		if (!hasPermission(user, Permission.CLAIMS_UPDATE))
			throw new ForbiddenException("Cannot assign claims to other users");
		result.userId = dto.userId;
	}

	if (dto.type !== undefined) {
		if (!hasPermission(user, Permission.CLAIMS_UPDATE))
			throw new ForbiddenException("Cannot change claim type");
		result.typeId = CLAIM_TYPES[dto.type].id;
	}

	if (dto.status !== undefined) {
		if (!hasPermission(user, Permission.CLAIMS_UPDATE))
			throw new ForbiddenException("Cannot change claim status");
		result.statusId = CLAIM_STATUSES[dto.status].id;
	}

	return result;
};
