import { isValidCustomerIce } from "@ecommand/shared";
import { z } from "zod";
import { Messages, type TypedMessageTranslator } from "@/i18n";

export function createCustomerFormSchema(t: TypedMessageTranslator) {
	const schema = z.object({
		companyName: z
			.string()
			.trim()
			.min(1, t(Messages.customers.form.companyNameRequired))
			.max(300, t(Messages.customers.form.maxCharacters, { count: 300 })),
		customerCode: z
			.string()
			.max(50, t(Messages.customers.form.maxCharacters, { count: 50 }))
			.optional(),
		ice: z
			.string()
			.refine((value) => value === "" || isValidCustomerIce(value), {
				message: t(Messages.customers.form.iceInvalid),
			})
			.optional(),
		address: z
			.string()
			.max(500, t(Messages.customers.form.maxCharacters, { count: 500 }))
			.optional(),
		city: z
			.string()
			.max(100, t(Messages.customers.form.maxCharacters, { count: 100 }))
			.optional(),
		phone: z
			.string()
			.max(20, t(Messages.customers.form.maxCharacters, { count: 20 }))
			.optional(),
		email: z
			.email(t(Messages.customers.form.emailInvalid))
			.max(100, t(Messages.customers.form.maxCharacters, { count: 100 }))
			.optional()
			.or(z.literal("")),
		typeId: z.string().optional(),
	});

	return {
		schema,
		identitySchema: schema.pick({ companyName: true }),
		steps: [
			{
				title: t(Messages.customers.form.company),
				description: t(Messages.customers.form.companyDescription),
			},
			{
				title: t(Messages.customers.form.contact),
				description: t(Messages.customers.form.contactDescription),
			},
		],
	};
}

export type CustomerFormValues = z.infer<
	ReturnType<typeof createCustomerFormSchema>["schema"]
>;
