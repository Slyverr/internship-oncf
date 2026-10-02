import { z } from "zod";
import { Messages, type TypedMessageTranslator } from "@/i18n";

export function createUserCredentialsSchema(t: TypedMessageTranslator) {
	return z.object({
		email: z
			.string()
			.min(1, t(Messages.users.form.validation.emailRequired))
			.pipe(z.email(t(Messages.users.form.validation.validEmail)).max(100)),
		password: z
			.string()
			.min(1, t(Messages.users.form.validation.passwordRequired))
			.pipe(
				z
					.string()
					.min(8, t(Messages.users.form.validation.passwordMin))
					.max(255),
			),
	});
}
