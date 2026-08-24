import { Permission, ProgramStatus } from "@ecommand/shared";
import { ForbiddenException } from "@nestjs/common";
import { AuthUser } from "src/auth/auth.types";
import { hasOnePermission } from "src/auth/auth.utils";
import { PROGRAM_STATUSES } from "src/db/reference-data";
import { ProgramInsert, ProgramUpdate } from "./programs.types";
import { CreateProgramDto } from "./requests/create-program.dto";
import { UpdateProgramDto } from "./requests/update-program.dto";

export const toCreate = (
	dto: CreateProgramDto,
	user: AuthUser,
): ProgramInsert => {
	const createdByUserId = dto.userId ?? user.id;
	if (
		createdByUserId !== user.id &&
		!hasOnePermission(user, Permission.PROGRAMS_MANAGE_OWNERSHIP)
	) {
		throw new ForbiddenException("Cannot assign programs to other users");
	}

	const status = hasOnePermission(user, Permission.PROGRAMS_STATUS_UPDATE)
		? (dto.status ?? ProgramStatus.DRAFT)
		: ProgramStatus.DRAFT;

	return {
		...dto,
		createdByUserId,
		statusId: PROGRAM_STATUSES[status].id,
		programNumber: `PRG-${Date.now()}-${Math.random()
			.toString(36)
			.slice(2, 7)}`,
	};
};

export const toUpdate = (
	dto: UpdateProgramDto,
	user: AuthUser,
): ProgramUpdate => {
	if (dto.userId !== undefined && dto.userId !== user.id) {
		if (!hasOnePermission(user, Permission.PROGRAMS_MANAGE_OWNERSHIP)) {
			throw new ForbiddenException("Cannot assign programs to other users");
		}
	}

	let statusId: ProgramUpdate["statusId"];
	if (dto.status !== undefined) {
		if (!hasOnePermission(user, Permission.PROGRAMS_STATUS_UPDATE)) {
			throw new ForbiddenException("Cannot change program status");
		}

		statusId = PROGRAM_STATUSES[dto.status].id;
	}

	return {
		...dto,
		...(dto.userId !== undefined ? { createdBy: dto.userId } : {}),
		statusId,
	};
};
