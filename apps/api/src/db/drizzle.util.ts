import { HttpException } from "@nestjs/common";
import { constraintHandlers, ErrorContext } from "./constraints";

export type { ErrorContext };

export async function withDbErrorHandling<T>(
	operation: () => Promise<T>,
	context: ErrorContext,
): Promise<T> {
	try {
		return await operation();
	} catch (err) {
		const constraint = err?.cause?.constraint;
		const handler = constraintHandlers[constraint];

		if (handler) {
			const { statusCode, code, message } = handler(context);
			throw new HttpException({ code, message }, statusCode);
		}

		throw err;
	}
}
