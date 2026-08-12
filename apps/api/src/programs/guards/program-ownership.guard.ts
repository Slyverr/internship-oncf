import { Permission } from "@ecommand/shared";
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { hasPermission } from "src/auth/auth.utils";
import { ProgramIdPipe } from "../pipes/program-id.pipe";
import { ProgramsService } from "../programs.service";

@Injectable()
export class ProgramOwnershipGuard implements CanActivate {
	private readonly programIdPipe = new ProgramIdPipe();

	constructor(private readonly programsService: ProgramsService) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!request.params.id) return true;
		if (hasPermission(user, Permission.ORDERS_MANAGE_USER)) return true;

		const id = this.programIdPipe.transform(request.params.id);
		const program = await this.programsService.findOne(id);
		if (program.createdBy !== user.id) {
			throw new ForbiddenException("You can only access your own programs");
		}

		return true;
	}
}
