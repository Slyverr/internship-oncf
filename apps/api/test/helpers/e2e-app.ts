import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";
import { AppModule } from "@/app.module";
import { configureApp } from "@/app.setup";
import { StorageService } from "@/storage/storage.service";
import { E2E_PASSWORD } from "../fixtures/e2e-fixtures";

export async function createE2eApp(): Promise<INestApplication<App>> {
	const moduleFixture = await Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideProvider(StorageService)
		.useValue({})
		.compile();

	const app = moduleFixture.createNestApplication();
	configureApp(app);
	await app.init();
	return app;
}

export async function login(
	app: INestApplication<App>,
	username: string,
	password = E2E_PASSWORD,
) {
	const response = await request(app.getHttpServer())
		.post("/auth/login")
		.send({ username, password })
		.expect(201);

	return response.body.access_token as string;
}
