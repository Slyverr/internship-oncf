import { API_ERROR_CODES } from "@ecommand/shared";
import type { INestApplication } from "@nestjs/common";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import {
	ApiExceptionFilter,
	toValidationDetails,
} from "./common/api-exception.filter";

export function configureApp(app: INestApplication) {
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			exceptionFactory: (errors) =>
				new BadRequestException({
					code: API_ERROR_CODES.VALIDATION_FAILED,
					details: toValidationDetails(errors),
				}),
		}),
	);
	app.useGlobalFilters(new ApiExceptionFilter());
}
