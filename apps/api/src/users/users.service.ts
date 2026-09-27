import { Permission, RegistrationStatus, Role } from "@ecommand/shared";
import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { AuthUser } from "@/auth/auth.types";
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
		return this.ensure(await this.usersQuery.findUser(id), id);
	}

	async findOneByEmail(email: UserEmail) {
		const user = await this.usersQuery.findUserByEmail(email);
		if (!user) {
			throw new NotFoundException(`User with email '${email}' not found`);
		}
		return user;
	}

	async findOneForAuth(id: UserId) {
		const user = this.ensure(await this.usersQuery.findUserForAuth(id), id);
		if (!user.role) {
			throw new NotFoundException(`Role not found for user ${id}`);
		}
		return {
			id: user.id,
			email: user.email,
			password: user.password,
			isActive: user.isActive,
			registrationStatus: user.registrationStatus,
			customerId: user.customerId,
			agencyId: user.agencyId,
			role: user.role.name as Role,
			permissions: user.role.rolePermissions
				.map((rp) => rp.permission?.name)
				.filter((name): name is Permission => name !== undefined),
		};
	}

	async create(dto: CreateUserDto, user: AuthUser) {
		this.ensureCustomerAssignment(dto.role, dto.customerId);
		const values = await this.usersMapper.toCreate(dto, user);
		const created = await this.usersQuery.createUser(values);
		return this.findOne(created.id);
	}

	async registerClient(input: ClientRegistrationInput) {
		const email = input.email.trim().toLowerCase();
		if (await this.usersQuery.findUserEmailExists(email)) {
			throw new ConflictException("An account with this email already exists");
		}

		const values = await this.usersMapper.toRegistration({
			...input,
			email,
			firstName: input.firstName.trim(),
			lastName: input.lastName.trim(),
		});
		await this.usersQuery.createUser(values);
		return { message: "Registration submitted for admin review." };
	}

	async reviewRegistration(id: UserId, status: RegistrationReviewDecision) {
		const current = await this.findOne(id);
		if (
			current.registrationStatus !== RegistrationStatus.PENDING ||
			current.role?.name !== Role.CLIENT_REPRESENTATIVE
		) {
			throw new ConflictException("This account is not awaiting review");
		}

		const updated = await this.usersQuery.reviewRegistration(
			id,
			current.roleId,
			status,
		);
		if (!updated) {
			throw new ConflictException("This account is no longer awaiting review");
		}

		return this.findOne(id);
	}

	async update(id: UserId, dto: UpdateUserDto, user: AuthUser) {
		const current = await this.findOne(id);
		const role = dto.role ?? (current.role?.name as Role | undefined);
		const customerId = dto.customerId ?? current.customerId;
		this.ensureCustomerAssignment(role, customerId);

		const values = await this.usersMapper.toUpdate(dto, user);
		await this.usersQuery.updateUser(id, values);
		return this.findOne(id);
	}

	async deactivate(id: UserId) {
		const user = await this.usersQuery.updateUser(id, { isActive: false });
		return this.ensure(user, id);
	}

	async exists(id: UserId) {
		return this.usersQuery.findUserExists(id);
	}

	private ensure<T>(user: T | undefined, id: UserId): T {
		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}
		return user;
	}

	private ensureCustomerAssignment(
		role: Role | undefined,
		customerId: number | null | undefined,
	) {
		if (role === Role.CLIENT_REPRESENTATIVE && !customerId) {
			throw new BadRequestException(
				"A customer must be assigned to client representatives",
			);
		}
	}
}
