import { Permission } from "@ecommand/shared";
import { createOwnershipGuard } from "src/auth/guards/ownership.factory";
import { ProgramIdPipe } from "../pipes/program-id.pipe";
import { ProgramsService } from "../programs.service";
import { ProgramId } from "../programs.types";

export const ProgramOwnershipGuard = createOwnershipGuard<
	ProgramsService,
	ProgramId
>({
	service: ProgramsService,
	resolveOwnerId: async (service, id) => {
		const owner = await service.findOne(id);
		return owner.createdBy;
	},

	pipe: new ProgramIdPipe(),
	permission: Permission.PROGRAMS_MANAGE_OTHER,
	errorMessage: "You can only access your own programs",
});
