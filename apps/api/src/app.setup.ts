import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";

export function configureApp(app: INestApplication) {
	app.useGlobalPipes(new ValidationPipe({ transform: true }));
}
