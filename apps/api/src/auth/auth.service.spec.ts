import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "@/email/email.service";
import { UsersService } from "@/users/users.service";
import { AuthQuery } from "./auth.query";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{ provide: UsersService, useValue: {} },
				{ provide: EmailService, useValue: {} },
				{ provide: AuthQuery, useValue: {} },
				{ provide: JwtService, useValue: {} },
				{ provide: ConfigService, useValue: {} },
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
