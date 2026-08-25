import { Permission } from "@ecommand/shared";
import { createOwnershipGuard } from "@/auth/guards/ownership.factory";
import { ProgramIdPipe } from "../pipes/program-id.pipe";
import { ProgramsService } from "../programs.service";
import { ProgramId } from "../programs.types";

export const ProgramOwnershipGuard = createOwnershipGuard<
	ProgramsService,
	ProgramId
>({
	service: ProgramsService,
	resolveOwnerId: async (service, id) => {
		const program = await service.findOneForOwnership(id);
		return program.createdByUserId;
	},
	pipe: new ProgramIdPipe(),
	permission: Permission.PROGRAMS_MANAGE_OTHER,
	errorMessage: "You can only access your own programs",
});
