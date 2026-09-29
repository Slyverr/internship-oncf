import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { configureApp } from "./app.setup";
import { stripSwaggerInternalMetadata } from "./common/swagger/strip-swagger-internal-metadata";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	configureApp(app);

	const config = new DocumentBuilder()
		.setTitle("ONCF ECommand API")
		.setDescription("ONCF freight order management")
		.setVersion("1.0")
		.addBearerAuth()
		.addSecurityRequirements("bearer")
		.build();

	const documentFactory = () => {
		const document = SwaggerModule.createDocument(app, config);
		stripSwaggerInternalMetadata(document);

		return document;
	};

	SwaggerModule.setup("api-docs", app, documentFactory, {
		swaggerOptions: {
			persistAuthorization: true,
		},
	});

	await app.listen(process.env.NESTJS_PORT ?? 8000);
}

bootstrap();
