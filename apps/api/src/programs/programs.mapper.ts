import { Permission, ProgramStatus } from "@ecommand/shared";
import { ForbiddenException } from "@nestjs/common";
import { AuthUser } from "@/auth/auth.types";
import { hasOnePermission } from "@/auth/auth.utils";
import { generateDocumentNumber } from "@/common/utils/document-number";
import { PROGRAM_STATUSES } from "@/database/reference-data";
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

	const status = hasOnePermission(user, Permission.PROGRAMS_MANAGE_STATUS)
		? (dto.status ?? ProgramStatus.DRAFT)
		: ProgramStatus.DRAFT;

	const programNumber = generateDocumentNumber("PRG");

	return {
		...dto,
		programNumber,
		createdByUserId,
		statusId: PROGRAM_STATUSES[status].id,
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
		if (!hasOnePermission(user, Permission.PROGRAMS_MANAGE_STATUS)) {
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
