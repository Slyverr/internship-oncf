import { Test, TestingModule } from "@nestjs/testing";
import { CustomersMapper } from "./customers.mapper";
import { CustomersQuery } from "./customers.query";
import { CustomersService } from "./customers.service";

describe("CustomersService", () => {
	let service: CustomersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CustomersService,
				{ provide: CustomersQuery, useValue: {} },
				{ provide: CustomersMapper, useValue: {} },
			],
		}).compile();

		service = module.get<CustomersService>(CustomersService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
