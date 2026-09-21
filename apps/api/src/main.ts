import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { stripSwaggerInternalMetadata } from "./common/swagger/strip-swagger-internal-metadata";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(new ValidationPipe({ transform: true }));

	const config = new DocumentBuilder()
		.setTitle("ONCF Ecommand API")
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
