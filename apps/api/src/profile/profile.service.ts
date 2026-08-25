import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { users } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { withDbErrorHandling } from "@/database/drizzle.util";
import { UserId } from "@/users/users.types";
import { profileColumns, profileRelations } from "./profile.query";
import { UpdateProfileDto } from "./requests/update-profile.dto";

@Injectable()
export class ProfileService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findOne(id: UserId) {
		const user = await this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: profileColumns,
			with: profileRelations,
		});

		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}

		if (!user.role) {
			throw new InternalServerErrorException(`User ${id} has no role assigned`);
		}

		return {
			...user,
			role: user.role.name,
			permissions: user.role.rolePermissions.flatMap(
				(rp) => rp.permission?.name ?? [],
			),
		};
	}

	async update(id: UserId, dto: UpdateProfileDto) {
		await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(users)
					.set(dto)
					.where(eq(users.id, id))
					.returning({ id: users.id }),
			dto,
		);

		return this.findOne(id);
	}
}
