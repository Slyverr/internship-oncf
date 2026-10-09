import {
	API_ERROR_CODES,
	PERMISSION_DEFINITIONS,
	Permission,
	RolePersona,
} from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	Optional,
} from "@nestjs/common";
import {
	REALTIME_EVENT_TYPES,
	RealtimeEventsService,
} from "@/realtime/realtime-events.service";
import { CreateRoleProfileDto } from "./requests/create-role-profile.dto";
import { UpdateRoleProfileDto } from "./requests/update-role-profile.dto";
import {
	assertCustomRolePermissions,
	isCustomRolePermissionAssignable,
	isCustomRolePersona,
} from "./role-profile-policy";
import { RolesQuery } from "./roles.query";

@Injectable()
export class RolesService {
	constructor(
		private readonly rolesQuery: RolesQuery,
		@Optional() private readonly realtimeEvents?: RealtimeEventsService,
	) {}

	async findProfiles() {
		const profiles = await this.rolesQuery.findProfiles();
		return profiles.map(({ rolePermissions, ...profile }) => ({
			...profile,
			permissionNames: rolePermissions.flatMap(({ permission }) =>
				permission ? [permission.name] : [],
			),
		}));
	}

	async findPermissionDefinitions() {
		const permissions = await this.rolesQuery.findPermissions();
		return permissions.map((permission) => ({
			name: permission.name,
			parent:
				PERMISSION_DEFINITIONS[permission.name as Permission]?.parent ??
				undefined,
			assignable: isCustomRolePermissionAssignable(
				permission.name as Permission,
			),
		}));
	}

	async createProfile(input: CreateRoleProfileDto, actorUserId: number) {
		this.validateProfile(input.name, input.persona, input.permissionNames);
		await this.ensurePermissionsActive(input.permissionNames);
		const created = await this.rolesQuery.createProfile(input, actorUserId);
		this.publishChanged();
		return (await this.findProfiles()).find(({ id }) => id === created.id);
	}

	async updateProfile(
		id: string,
		input: UpdateRoleProfileDto,
		actorUserId: number,
	) {
		if (input.name !== undefined && !input.name.trim()) {
			throw new BadRequestException({
				code: API_ERROR_CODES.VALIDATION_FAILED,
			});
		}
		if (
			input.persona !== undefined &&
			!isCustomRolePersona(input.persona as RolePersona)
		) {
			throw new BadRequestException({
				code: API_ERROR_CODES.VALIDATION_FAILED,
			});
		}
		if (input.permissionNames !== undefined) {
			assertCustomRolePermissions(input.permissionNames);
			await this.ensurePermissionsActive(input.permissionNames);
		}

		const result = await this.rolesQuery.updateProfile(id, input, actorUserId);
		if (result === undefined) {
			throw new NotFoundException({ code: API_ERROR_CODES.RESOURCE_NOT_FOUND });
		}
		if (result === "SYSTEM_ROLE") {
			throw new ForbiddenException({ code: API_ERROR_CODES.ACCESS_DENIED });
		}
		if (result === "ROLE_IN_USE") {
			throw new ConflictException({
				code: API_ERROR_CODES.ROLE_PROFILE_IN_USE,
			});
		}
		this.publishChanged();
		return (await this.findProfiles()).find((profile) => profile.id === id);
	}

	private publishChanged() {
		this.realtimeEvents?.publish(REALTIME_EVENT_TYPES.rolesChanged);
	}

	private async ensurePermissionsActive(names: readonly Permission[]) {
		const activeNames = new Set(
			(await this.rolesQuery.findPermissions()).map(({ name }) => name),
		);
		if (names.some((name) => !activeNames.has(name))) {
			throw new BadRequestException({
				code: API_ERROR_CODES.ROLE_PERMISSION_UNAVAILABLE,
			});
		}
	}

	private validateProfile(
		name: string,
		persona: RolePersona,
		permissions: readonly Permission[],
	) {
		if (!name.trim() || !isCustomRolePersona(persona)) {
			throw new BadRequestException({
				code: API_ERROR_CODES.VALIDATION_FAILED,
			});
		}
		assertCustomRolePermissions(permissions);
	}
}
