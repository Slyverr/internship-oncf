import { applyDecorators, HttpStatus, Type } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

type CrudResponseConfig = {
	detail: Type<unknown>;
	list: Type<unknown>;
	create?: Type<unknown>;
	update?: Type<unknown>;
	remove?: Type<unknown>;
	detailErrors?: HttpStatus[];
	listErrors?: HttpStatus[];
	createErrors?: HttpStatus[];
	updateErrors?: HttpStatus[];
	removeErrors?: HttpStatus[];
};

function withApiResponses(
	status: HttpStatus,
	type: Type<unknown>,
	errors: HttpStatus[] = [],
) {
	return applyDecorators(
		ApiResponse({ status, type }),
		...errors.map((error) => ApiResponse({ status: error })),
	);
}

export function createCrudResponses(config: CrudResponseConfig) {
	return {
		detail: () =>
			withApiResponses(
				HttpStatus.OK,
				config.detail,
				config.detailErrors ?? [
					HttpStatus.UNAUTHORIZED,
					HttpStatus.BAD_REQUEST,
					HttpStatus.FORBIDDEN,
					HttpStatus.NOT_FOUND,
				],
			),

		list: () =>
			withApiResponses(
				HttpStatus.OK,
				config.list,
				config.listErrors ?? [HttpStatus.UNAUTHORIZED],
			),

		create: () =>
			withApiResponses(
				HttpStatus.CREATED,
				config.create ?? config.detail,
				config.createErrors ?? [
					HttpStatus.UNAUTHORIZED,
					HttpStatus.BAD_REQUEST,
					HttpStatus.FORBIDDEN,
				],
			),

		update: () =>
			withApiResponses(
				HttpStatus.OK,
				config.update ?? config.detail,
				config.updateErrors ?? [
					HttpStatus.UNAUTHORIZED,
					HttpStatus.BAD_REQUEST,
					HttpStatus.FORBIDDEN,
					HttpStatus.NOT_FOUND,
				],
			),

		remove: () =>
			withApiResponses(
				HttpStatus.OK,
				config.remove ?? config.detail,
				config.removeErrors ?? [
					HttpStatus.UNAUTHORIZED,
					HttpStatus.FORBIDDEN,
					HttpStatus.NOT_FOUND,
				],
			),
	};
}
