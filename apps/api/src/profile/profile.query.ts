import { Injectable } from "@nestjs/common";
import { userPreferences, users } from "drizzle/schema";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@/database/drizzle.service";
import { QueryColumns, QueryRelations } from "@/database/drizzle.types";
import { withDbErrorHandling } from "@/database/drizzle.util";
import type { UserId, UserUpdate } from "@/users/users.types";
import type { UpdateAppearancePreferencesDto } from "./requests/update-appearance-preferences.dto";

type UsersColumns = QueryColumns<"users">;
type UsersRelations = QueryRelations<"users">;

const profileColumns = {
	id: true,
	email: true,
	firstName: true,
	lastName: true,
	employeeCode: true,
	type: true,
	roleId: true,
	customerId: true,
	agencyId: true,
	createdAt: true,
	lastLogin: true,
} satisfies UsersColumns;

const profileRelations = {
	customer: {
		columns: { companyName: true, customerCode: true },
	},
	role: {
		columns: { name: true },
		with: {
			rolePermissions: {
				columns: {},
				with: {
					permission: {
						columns: { name: true },
					},
				},
			},
		},
	},
} satisfies UsersRelations;

@Injectable()
export class ProfileQuery {
	constructor(private readonly drizzle: DrizzleService) {}

	async findProfile(id: UserId) {
		return this.drizzle.db.query.users.findFirst({
			where: { id },
			columns: profileColumns,
			with: profileRelations,
		});
	}

	async updateProfile(id: UserId, values: UserUpdate) {
		const [updated] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.update(users)
					.set(values)
					.where(eq(users.id, id))
					.returning({
						id: users.id,
					}),
			values,
		);
		return updated;
	}

	async findPreferences(userId: UserId) {
		return this.drizzle.db.query.userPreferences.findFirst({
			where: { userId },
			columns: {
				theme: true,
				fontFamily: true,
				textSize: true,
				motion: true,
				workspaceLayout: true,
				updatedAt: true,
			},
		});
	}

	async savePreferences(
		userId: UserId,
		values: UpdateAppearancePreferencesDto,
	) {
		const [saved] = await withDbErrorHandling(
			() =>
				this.drizzle.db
					.insert(userPreferences)
					.values({ userId, ...values })
					.onConflictDoUpdate({
						target: userPreferences.userId,
						set: { ...values, updatedAt: new Date().toISOString() },
					})
					.returning({
						theme: userPreferences.theme,
						fontFamily: userPreferences.fontFamily,
						textSize: userPreferences.textSize,
						motion: userPreferences.motion,
						workspaceLayout: userPreferences.workspaceLayout,
						updatedAt: userPreferences.updatedAt,
					}),
			{ userId, ...values },
		);
		return saved;
	}
}
