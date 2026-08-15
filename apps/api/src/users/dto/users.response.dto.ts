export class UsersResponseDto {
	id: number;
	email: string;
	firstName?: string;
	lastName?: string;
	roleId?: number;
	customerId?: number;
	agencyId?: number;
	isActive: boolean;
	lastLogin?: string;
	createdAt: string;
	updatedAt: string;
}
