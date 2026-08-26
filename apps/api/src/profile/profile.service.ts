import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { DrizzleService } from "@/database/drizzle.service";
import type { UserId } from "@/users/users.types";
import { findProfile, updateProfile } from "./profile.query";
import { UpdateProfileDto } from "./requests/update-profile.dto";

@Injectable()
export class ProfileService {
	constructor(private readonly drizzle: DrizzleService) {}

	async findOne(id: UserId) {
		const user = await findProfile(this.drizzle.db, id);
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
		await updateProfile(this.drizzle.db, id, dto);
		return this.findOne(id);
	}
}
