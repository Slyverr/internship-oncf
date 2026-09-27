import { ApiProperty } from "@nestjs/swagger";

export class RegistrationSubmittedDto {
	@ApiProperty({ example: "Registration submitted for admin review." })
	message: string;
}
