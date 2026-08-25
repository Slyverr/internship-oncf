import { applyDecorators, HttpStatus, Type } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

type ResponseType = Type<unknown> | [Type<unknown>];

type CustomResponseConfig = {
	type: ResponseType;
	status?: HttpStatus;
	errors?: HttpStatus[];
};

type CrudResponseConfig<TCustom extends Record<string, CustomResponseConfig>> =
	{
		list: Type<unknown>;
		detail: Type<unknown>;
		create?: Type<unknown>;
		update?: Type<unknown>;
		remove?: Type<unknown>;
		listErrors?: HttpStatus[];
		detailErrors?: HttpStatus[];
		createErrors?: HttpStatus[];
		updateErrors?: HttpStatus[];
		removeErrors?: HttpStatus[];
		custom?: TCustom;
	};

function withApiResponses(
	status: HttpStatus,
	type: ResponseType,
	errors: HttpStatus[] = [],
) {
	return applyDecorators(
		ApiResponse({ status, type }),
		...errors.map((status) => ApiResponse({ status })),
	);
}

export function createCrudResponses<
	TCustom extends Record<string, CustomResponseConfig>,
>(config: CrudResponseConfig<TCustom>) {
	const base = {
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
				[config.list],
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

	const custom = Object.fromEntries(
		Object.entries(config.custom ?? {}).map(([name, options]) => [
			name,
			() =>
				withApiResponses(
					options.status ?? HttpStatus.OK,
					options.type,
					options.errors ?? [HttpStatus.UNAUTHORIZED],
				),
		]),
	) as {
		[K in keyof TCustom]: () => ReturnType<typeof applyDecorators>;
	};

	return { ...base, ...custom };
}
