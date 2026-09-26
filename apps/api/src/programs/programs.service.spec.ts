import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "@/notifications/notifications.service";
import { ProgramsMapper } from "./programs.mapper";
import { ProgramsQuery } from "./programs.query";
import { ProgramsService } from "./programs.service";

describe("ProgramsService", () => {
	let service: ProgramsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProgramsService,
				{ provide: NotificationsService, useValue: {} },
				{ provide: ProgramsQuery, useValue: {} },
				{ provide: ProgramsMapper, useValue: {} },
			],
		}).compile();

		service = module.get<ProgramsService>(ProgramsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
