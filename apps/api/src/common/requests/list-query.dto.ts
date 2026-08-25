import { IsIn, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "./pagination-query.dto";

export class ListQueryDto extends PaginationQueryDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsString()
	sortBy?: string;

	@IsOptional()
	@IsIn(["asc", "desc"])
	sortOrder?: "asc" | "desc";
}
