import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ManagedReferenceDataDto {
	@ApiProperty()
	id: number;

	@ApiProperty()
	name: string;

	@ApiProperty()
	isActive: boolean;

	@ApiPropertyOptional()
	stationCode?: string;

	@ApiPropertyOptional({ nullable: true })
	address?: string | null;

	@ApiPropertyOptional({ nullable: true })
	city?: string | null;

	@ApiPropertyOptional({ nullable: true })
	phone?: string | null;

	@ApiPropertyOptional({ nullable: true })
	email?: string | null;

	@ApiPropertyOptional({ enum: ["normal", "dry"] })
	type?: string;

	@ApiPropertyOptional({ nullable: true })
	stationId?: number | null;

	@ApiPropertyOptional()
	portId?: number;

	@ApiPropertyOptional({ nullable: true })
	stationName?: string | null;

	@ApiPropertyOptional({ nullable: true })
	portName?: string | null;
}
