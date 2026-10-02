import {
	API_ERROR_CODES,
	API_RESPONSE_CODES,
	Permission,
	RegistrationStatus,
	Role,
	RolePersona,
} from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { AuthUser } from "@/auth/auth.types";
import { ROLES } from "@/database/reference-data";
import { CreateUserDto } from "./requests/create-user.dto";
import type { RegistrationReviewDecision } from "./requests/review-user-registration.dto";
import { UpdateUserDto } from "./requests/update-user.dto";
import { UsersMapper } from "./users.mapper";
import { UsersQuery } from "./users.query";
import type { ClientRegistrationInput, UserEmail, UserId } from "./users.types";

@Injectable()
export class UsersService {
	constructor(
		private readonly usersQuery: UsersQuery,
		private readonly usersMapper: UsersMapper,
	) {}

	async findAll() {
		return this.usersQuery.findUsers();
	}

	async findOne(id: UserId) {
		return this.ensure(await this.usersQuery.findUser(id));
	}

	async findOneByEmail(email: UserEmail) {
		const user = await this.usersQuery.findUserByEmail(email);
		if (!user) {
			throw new NotFoundException({ code: API_ERROR_CODES.USER_NOT_FOUND });
		}
		return user;
	}

	async findOneByLoginIdentifier(identifier: string) {
		return this.usersQuery.findUserByLoginIdentifier(identifier);
	}

	async findOneForAuth(id: UserId) {
		const user = this.ensure(await this.usersQuery.findUserForAuth(id));
		if (!user.role) {
			throw new NotFoundException({
				code: API_ERROR_CODES.USER_ROLE_NOT_FOUND,
			});
		}
		return {
			id: user.id,
			email: user.email,
			password: user.password,
			isActive: user.isActive,
			registrationStatus: user.registrationStatus,
			customerId: user.customerId,
			agencyId: user.agencyId,
			assignedCustomerIds: (user.userCustomers ?? []).map(
				({ customerId }) => customerId,
			),
			role: user.role.name,
			persona: user.role.persona,
			permissions: user.role.rolePermissions
				.map((rp) => rp.permission?.name)
				.filter((name): name is Permission => name !== undefined),
		};
	}

	async create(dto: CreateUserDto, user: AuthUser) {
		const role = await this.resolveRole(dto.roleId, dto.role);
		this.ensureCustomerAssignment(role.persona, dto.customerId);
		const values = await this.usersMapper.toCreate(dto, user, role.id);
		const created = await this.usersQuery.createUser(
			values,
			role.persona === RolePersona.AGENT_COMMERCIAL
				? (dto.customerIds ?? [])
				: undefined,
		);
		return this.findOne(created.id);
	}

	async registerClient(input: ClientRegistrationInput) {
		const email = input.email.trim().toLowerCase();
		if (await this.usersQuery.findUserEmailExists(email)) {
			throw new ConflictException({
				code: API_ERROR_CODES.USER_EMAIL_ALREADY_EXISTS,
			});
		}

		const values = await this.usersMapper.toRegistration({
			...input,
			email,
			firstName: input.firstName.trim(),
			lastName: input.lastName.trim(),
		});
		await this.usersQuery.createUser(values);
		return { code: API_RESPONSE_CODES.REGISTRATION_SUBMITTED_FOR_REVIEW };
	}

	async reviewRegistration(id: UserId, status: RegistrationReviewDecision) {
		const current = await this.findOne(id);
		const role = await this.usersQuery.findAssignableRole(current.roleId);
		if (
			current.registrationStatus !== RegistrationStatus.PENDING ||
			role?.persona !== RolePersona.CLIENT_REPRESENTATIVE
		) {
			throw new ConflictException({
				code: API_ERROR_CODES.ACCOUNT_REGISTRATION_NOT_PENDING,
			});
		}

		const updated = await this.usersQuery.reviewRegistration(
			id,
			current.roleId,
			status,
		);
		if (!updated) {
			throw new ConflictException({
				code: API_ERROR_CODES.ACCOUNT_REGISTRATION_NOT_PENDING,
			});
		}

		return this.findOne(id);
	}

	async update(id: UserId, dto: UpdateUserDto, user: AuthUser) {
		const current = await this.findOne(id);
		const role = await this.resolveRole(dto.roleId, dto.role, current.roleId);
		const customerId = dto.customerId ?? current.customerId;
		this.ensureCustomerAssignment(role.persona, customerId);

		const assignedRoleId =
			dto.roleId !== undefined || dto.role !== undefined ? role.id : undefined;
		const values = await this.usersMapper.toUpdate(dto, user, assignedRoleId);
		const roleChanged = dto.role !== undefined || dto.roleId !== undefined;
		let customerIds: readonly number[] | undefined;
		if (dto.customerIds !== undefined) {
			customerIds =
				role.persona === RolePersona.AGENT_COMMERCIAL ? dto.customerIds : [];
		} else if (roleChanged && role.persona !== RolePersona.AGENT_COMMERCIAL) {
			customerIds = [];
		}

		await this.usersQuery.updateUserAndAssignments(id, values, customerIds);
		return this.findOne(id);
	}

	async deactivate(id: UserId) {
		const user = await this.usersQuery.deactivateUser(id);
		if (user === "LAST_ACTIVE_ADMIN") {
			throw new ConflictException({
				code: API_ERROR_CODES.LAST_ACTIVE_ADMIN,
			});
		}
		return this.ensure(user);
	}

	async exists(id: UserId) {
		return this.usersQuery.findUserExists(id);
	}

	private ensure<T>(user: T | undefined): T {
		if (!user) {
			throw new NotFoundException({ code: API_ERROR_CODES.USER_NOT_FOUND });
		}
		return user;
	}

	private ensureCustomerAssignment(
		persona: RolePersona | null,
		customerId: number | null | undefined,
	) {
		if (persona === RolePersona.CLIENT_REPRESENTATIVE && !customerId) {
			throw new BadRequestException({
				code: API_ERROR_CODES.CUSTOMER_ASSIGNMENT_REQUIRED,
			});
		}
	}

	private async resolveRole(
		roleId?: string,
		legacyRole?: Role,
		fallbackRoleId?: string,
	) {
		if (roleId && legacyRole) {
			throw new BadRequestException({
				code: API_ERROR_CODES.VALIDATION_FAILED,
			});
		}
		const selectedRoleId =
			roleId ??
			(legacyRole ? ROLES[legacyRole].id : undefined) ??
			fallbackRoleId;
		if (!selectedRoleId) {
			throw new BadRequestException({
				code: API_ERROR_CODES.VALIDATION_FAILED,
			});
		}
		const role = await this.usersQuery.findAssignableRole(selectedRoleId);
		if (!role) {
			throw new NotFoundException({
				code: API_ERROR_CODES.USER_ROLE_NOT_FOUND,
			});
		}
		return role;
	}
}
