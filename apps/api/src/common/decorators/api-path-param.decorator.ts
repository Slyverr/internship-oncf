import { Param, type PipeTransform, type Type } from "@nestjs/common";
import { ApiParam } from "@nestjs/swagger";

export function ApiPathParam(
	name: string,
	...pipes: (PipeTransform | Type<PipeTransform>)[]
): ParameterDecorator {
	const bindRouteParam = Param(name, ...pipes);
	const bindOpenApiParam = ApiParam({ name, type: Number });

	return (target, propertyKey, parameterIndex) => {
		bindRouteParam(target, propertyKey, parameterIndex);

		if (propertyKey === undefined) return;

		const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
		if (descriptor) {
			bindOpenApiParam(target, propertyKey, descriptor);
		}
	};
}

export function ApiStringPathParam(
	name: string,
	...pipes: (PipeTransform | Type<PipeTransform>)[]
): ParameterDecorator {
	const bindRouteParam = Param(name, ...pipes);
	const bindOpenApiParam = ApiParam({ name, type: String });

	return (target, propertyKey, parameterIndex) => {
		bindRouteParam(target, propertyKey, parameterIndex);

		if (propertyKey === undefined) return;

		const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
		if (descriptor) {
			bindOpenApiParam(target, propertyKey, descriptor);
		}
	};
}
