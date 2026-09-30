import { Test, TestingModule } from "@nestjs/testing";
import { ProgramsController } from "./programs.controller";
import { ProgramsService } from "./programs.service";

describe("ProgramsController", () => {
	let controller: ProgramsController;
	const service = {
		resolveProgramId: jest.fn(),
		findOne: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [ProgramsController],
			providers: [{ provide: ProgramsService, useValue: service }],
		}).compile();

		controller = module.get<ProgramsController>(ProgramsController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	it("resolves a public program number before reading its internal record", async () => {
		service.resolveProgramId.mockResolvedValue(27);
		service.findOne.mockResolvedValue({ id: 27 });

		await expect(controller.findOne("PRG-ABCDEFGHIJ")).resolves.toEqual({
			id: 27,
		});
		expect(service.resolveProgramId).toHaveBeenCalledWith("PRG-ABCDEFGHIJ");
		expect(service.findOne).toHaveBeenCalledWith(27);
	});
});
