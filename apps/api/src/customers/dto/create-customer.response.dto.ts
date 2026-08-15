export class CreateCustomerResponseDto {
	id: number;
	companyName: string;
	address?: string;
	city?: string;
	phone?: string;
	email?: string;
	typeId?: number;
	customerCode?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}
