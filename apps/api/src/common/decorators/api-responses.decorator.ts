import { applyDecorators, HttpStatus, Type } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export interface ApiResponsesOptions {
	type: Type<unknown> | [Type<unknown>];
	status: HttpStatus;
	errors?: HttpStatus[];
}

export interface ApiResponsesPatchOptions extends Partial<ApiResponsesOptions> {
	removeErrors?: HttpStatus[];
	addErrors?: HttpStatus[];
}

export function ApiResponses(options: ApiResponsesOptions) {
	return applyDecorators(
		ApiResponse({
			status: options.status,
			type: options.type,
		}),
		...(options.errors ?? []).map((status) => ApiResponse({ status })),
	);
}

export function ApiResponsesPatch(
	base: ApiResponsesOptions,
	patch: ApiResponsesPatchOptions,
) {
	const errors = patch.errors
		? patch.errors
		: (base.errors ?? [])
				.filter((status) => !patch.removeErrors?.includes(status))
				.concat(patch.addErrors ?? []);

	return ApiResponses({
		type: patch.type ?? base.type,
		status: patch.status ?? base.status,
		errors,
	});
}
