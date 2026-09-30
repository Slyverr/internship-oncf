import { createOwnershipGuard } from "@/auth/guards/ownership.factory";
import { ProgramNumberPipe } from "../pipes/program-number.pipe";
import { canAccessProgram } from "../programs.access";
import { ProgramsService } from "../programs.service";
import { ProgramNumber } from "../programs.types";

export const ProgramOwnershipGuard = createOwnershipGuard<
	ProgramsService,
	ProgramNumber
>({
	service: ProgramsService,
	canAccess: async (service, id, user) => {
		const program = await service.findOneForOwnership(id);
		return canAccessProgram(program, user);
	},
	pipe: new ProgramNumberPipe(),
	errorMessage: "You can only access your own programs",
});
