import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe({ transform: true }));

	const config = new DocumentBuilder()
		.setTitle("E-Commande API")
		.setDescription("ONCF freight order management")
		.setVersion("1.0")
		.addBearerAuth()
		.addSecurityRequirements("bearer")
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api-docs", app, documentFactory);

	await app.listen(process.env.NESTJS_PORT ?? 8000);
}

bootstrap();
