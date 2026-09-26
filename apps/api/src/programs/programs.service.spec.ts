import { ProgramStatus } from "@ecommand/shared";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { PROGRAM_STATUSES } from "@/database/reference-data";
import { ProgramsQuery } from "./programs.query";
import { ProgramsService } from "./programs.service";
import type { ProgramId } from "./programs.types";

describe("ProgramsService lifecycle", () => {
	const notifyChange = jest.fn();
	const query = {
		findProgram: jest.fn(),
		findProgramStatus: jest.fn(),
		updateProgram: jest.fn(),
	};
	const service = new ProgramsService(
		{ notifyChange } as never,
		query as unknown as ProgramsQuery,
		{} as never,
	);
	const id = 5 as ProgramId;
	const user = { id: 7 } as never;

	beforeEach(() => {
		query.findProgram.mockReset();
		query.findProgramStatus.mockReset();
		query.updateProgram.mockReset();
		notifyChange.mockReset();
	});

	it("submits a draft program with a conditional status update and notification", async () => {
		query.findProgramStatus.mockResolvedValue({
			statusId: PROGRAM_STATUSES[ProgramStatus.DRAFT].id,
		});
		query.updateProgram.mockResolvedValue({ id });
		const result = {
			id,
			createdByUserId: 20,
			programStatus: { name: ProgramStatus.PENDING_APPROVAL },
		};
		query.findProgram.mockResolvedValue(result);
		await expect(service.submit(id, user)).resolves.toBe(result);
		expect(query.updateProgram).toHaveBeenCalledWith(
			id,
			{ statusId: PROGRAM_STATUSES[ProgramStatus.PENDING_APPROVAL].id },
			expect.anything(),
		);
		expect(notifyChange).toHaveBeenCalledWith(
			20,
			7,
			"programs",
			id,
			expect.stringContaining("pending approval"),
		);
	});

	it("rejects transitions that are not valid from the current state", async () => {
		query.findProgramStatus.mockResolvedValue({
			statusId: PROGRAM_STATUSES[ProgramStatus.SENT_TO_DTM].id,
		});
		await expect(service.submit(id, user)).rejects.toBeInstanceOf(
			ConflictException,
		);
		expect(query.updateProgram).not.toHaveBeenCalled();
		expect(notifyChange).not.toHaveBeenCalled();
	});

	it("rejects an unknown status reference", async () => {
		query.findProgramStatus.mockResolvedValue({ statusId: "missing-status" });
		await expect(service.submit(id, user)).rejects.toThrow("Invalid status");
		expect(query.updateProgram).not.toHaveBeenCalled();
	});

	it("returns not found when the program does not exist", async () => {
		query.findProgramStatus.mockResolvedValue(undefined);
		await expect(service.submit(id, user)).rejects.toBeInstanceOf(
			NotFoundException,
		);
	});

	it("reports a conflict if another request changes the program first", async () => {
		query.findProgramStatus.mockResolvedValue({
			statusId: PROGRAM_STATUSES[ProgramStatus.DRAFT].id,
		});
		query.updateProgram.mockResolvedValue(undefined);
		await expect(service.submit(id, user)).rejects.toBeInstanceOf(
			ConflictException,
		);
		expect(query.findProgram).not.toHaveBeenCalled();
		expect(notifyChange).not.toHaveBeenCalled();
	});
});
