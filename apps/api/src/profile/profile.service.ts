import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import type { UserId } from "@/users/users.types";
import { ProfileQuery } from "./profile.query";
import { UpdateAppearancePreferencesDto } from "./requests/update-appearance-preferences.dto";
import { UpdateProfileDto } from "./requests/update-profile.dto";

@Injectable()
export class ProfileService {
	constructor(private readonly profileQuery: ProfileQuery) {}

	async findOne(id: UserId) {
		const user = await this.profileQuery.findProfile(id);
		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}

		if (!user.role) {
			throw new InternalServerErrorException(`User ${id} has no role assigned`);
		}

		const { customer, ...profile } = user;
		return {
			...profile,
			customerName: customer?.companyName ?? null,
			customerCode: customer?.customerCode ?? null,
			role: user.role.name,
			permissions: user.role.rolePermissions
				.map((rp) => rp.permission?.name)
				.filter((name): name is string => name !== undefined),
		};
	}

	async update(id: UserId, dto: UpdateProfileDto) {
		await this.profileQuery.updateProfile(id, dto);
		return this.findOne(id);
	}

	async findPreferences(id: UserId) {
		return (await this.profileQuery.findPreferences(id)) ?? null;
	}

	async updatePreferences(id: UserId, dto: UpdateAppearancePreferencesDto) {
		return this.profileQuery.savePreferences(id, dto);
	}
}
