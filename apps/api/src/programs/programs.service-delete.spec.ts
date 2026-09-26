import { ProgramStatus } from "@ecommand/shared";
import { ConflictException } from "@nestjs/common";
import { ProgramsQuery } from "./programs.query";
import { ProgramsService } from "./programs.service";
import type { ProgramId } from "./programs.types";

describe("ProgramsService deletion", () => {
	const findProgram = jest.fn();
	const removeProgram = jest.fn();
	const service = new ProgramsService(
		{} as never,
		{ findProgram, removeProgram } as unknown as ProgramsQuery,
		{} as never,
	);
	const id = 5 as ProgramId;

	beforeEach(() => {
		findProgram.mockReset();
		removeProgram.mockReset();
	});

	it("deletes a draft program", async () => {
		findProgram.mockResolvedValue({
			programStatus: { name: ProgramStatus.DRAFT },
		});
		removeProgram.mockResolvedValue({ id });
		await expect(service.remove(id)).resolves.toEqual({ id });
		expect(removeProgram).toHaveBeenCalledWith(id);
	});

	it.each([
		ProgramStatus.PENDING_APPROVAL,
		ProgramStatus.APPROVED,
		ProgramStatus.SENT_TO_DTM,
	])("rejects deletion for a program in %s status", async (status) => {
		findProgram.mockResolvedValue({ programStatus: { name: status } });
		await expect(service.remove(id)).rejects.toBeInstanceOf(ConflictException);
		expect(removeProgram).not.toHaveBeenCalled();
	});
});
