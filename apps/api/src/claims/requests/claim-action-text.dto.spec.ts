import {
	CLAIM_REJECTION_REASON_MAX_LENGTH,
	CLAIM_RESOLUTION_MAX_LENGTH,
} from "@ecommand/shared";
import { type ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RejectClaimDto } from "./reject-claim.dto";
import { ResolveClaimDto } from "./resolve-claim.dto";

function verifyClaimTextDto<T extends RejectClaimDto | ResolveClaimDto>(
	label: string,
	Dto: ClassConstructor<T>,
	field: "rejectionReason" | "resolution",
	maxLength: number,
) {
	describe(`claim ${label} text`, () => {
		const toDto = (value: string) => plainToInstance(Dto, { [field]: value });

		it("rejects blank text", async () => {
			const errors = await validate(toDto(" \t "));
			expect(errors).toHaveLength(1);
			expect(errors[0]?.constraints).toHaveProperty("isNotEmpty");
		});

		it("rejects text beyond the shared limit", async () => {
			const errors = await validate(toDto("x".repeat(maxLength + 1)));
			expect(errors[0]?.constraints).toHaveProperty("maxLength");
		});

		it("accepts valid text", async () => {
			const dto = toDto(` Valid ${label} `);
			expect(await validate(dto)).toHaveLength(0);
			expect(dto).toMatchObject({ [field]: `Valid ${label}` });
		});
	});
}

verifyClaimTextDto(
	"rejection reason",
	RejectClaimDto,
	"rejectionReason",
	CLAIM_REJECTION_REASON_MAX_LENGTH,
);
verifyClaimTextDto(
	"resolution",
	ResolveClaimDto,
	"resolution",
	CLAIM_RESOLUTION_MAX_LENGTH,
);
