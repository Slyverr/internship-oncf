import { z } from "zod";

export const customerFormSchema = z.object({
	companyName: z
		.string()
		.trim()
		.min(1, "Company name is required")
		.max(300, "Max 300 characters"),
	customerCode: z.string().max(50, "Max 50 characters").optional(),
	ice: z
		.string()
		.refine((value) => value === "" || /^\d{15}$/.test(value), {
			message: "ICE must contain exactly 15 digits",
		})
		.optional(),
	address: z.string().max(500, "Max 500 characters").optional(),
	city: z.string().max(100, "Max 100 characters").optional(),
	phone: z.string().max(20, "Max 20 characters").optional(),
	email: z
		.email("Invalid email")
		.max(100, "Max 100 characters")
		.optional()
		.or(z.literal("")),
	typeId: z.string().optional(),
});

export const customerIdentitySchema = customerFormSchema.pick({
	companyName: true,
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const customerFormSteps = [
	{ title: "Company", description: "Identification details" },
	{ title: "Contact", description: "Address and communication" },
];
