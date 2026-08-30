"use client";

import { useForm } from "@tanstack/react-form-nextjs";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomersControllerUpdate } from "@/lib/api/customers";
import type { CustomerDetailDto } from "@/lib/api/generated.schemas";

const updateCustomerSchema = z.object({
	companyName: z
		.string()
		.trim()
		.min(1, "Company name is required")
		.max(300, "Max 300 characters"),
	customerCode: z.string().max(50, "Max 50 characters").optional(),
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

type UpdateCustomerFormValues = z.infer<typeof updateCustomerSchema>;

function getErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	if (typeof error === "string") return error;
	if (typeof error === "object" && "message" in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === "string") return message;
	}
	return String(error);
}

function FieldHeader({
	htmlFor,
	label,
	required,
	error,
}: {
	htmlFor: string;
	label: string;
	required?: boolean;
	error?: string;
}): JSX.Element {
	return (
		<div className="flex items-center justify-between gap-2">
			<Label htmlFor={htmlFor} className={error ? "text-destructive" : ""}>
				{label} {required ? "*" : ""}
			</Label>
			{error && (
				<span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
					<AlertCircle className="h-3.5 w-3.5 shrink-0" />
					{error}
				</span>
			)}
		</div>
	);
}

export function CustomerEditForm({
	customer,
}: {
	customer: CustomerDetailDto;
}): JSX.Element {
	const router = useRouter();
	const mutation = useCustomersControllerUpdate();

	const form = useForm({
		defaultValues: {
			companyName: customer.companyName,
			customerCode: customer.customerCode ?? "",
			address: customer.address ?? "",
			city: customer.city ?? "",
			phone: customer.phone ?? "",
			email: customer.email ?? "",
			typeId: customer.typeId ?? "",
		} as UpdateCustomerFormValues,
		validators: {
			onChange: updateCustomerSchema,
		},
		onSubmit: async ({ value }) => {
			mutation.mutate(
				{
					id: customer.id,
					data: {
						companyName: value.companyName.trim(),
						...(value.customerCode?.trim()
							? { customerCode: value.customerCode.trim() }
							: {}),
						...(value.address?.trim() ? { address: value.address.trim() } : {}),
						...(value.city?.trim() ? { city: value.city.trim() } : {}),
						...(value.phone?.trim() ? { phone: value.phone.trim() } : {}),
						...(value.email?.trim() ? { email: value.email.trim() } : {}),
						...(value.typeId?.trim() ? { typeId: value.typeId.trim() } : {}),
					},
				},
				{
					onSuccess: (updatedCustomer) => {
						router.push(`/dashboard/customers/${updatedCustomer.id}`);
					},
				},
			);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<Card>
				<CardHeader>
					<CardTitle>Company Overview</CardTitle>
					<CardDescription>
						Update primary corporate identifiers.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<form.Field name="companyName">
						{(field) => {
							const errorMsg = getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FieldHeader
										htmlFor="companyName"
										label="Company Name"
										required
										error={errorMsg}
									/>
									<Input
										id="companyName"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										className={
											errorMsg
												? "border-destructive focus-visible:ring-destructive/20"
												: ""
										}
									/>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="customerCode">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="customerCode">Customer Code</Label>
								<Input
									id="customerCode"
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="typeId">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="typeId">Type Identifier</Label>
								<Input
									id="typeId"
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Contact & Location</CardTitle>
					<CardDescription>
						Address and primary communication lines.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<form.Field name="email">
						{(field) => {
							const errorMsg = getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FieldHeader
										htmlFor="email"
										label="Email Address"
										error={errorMsg}
									/>
									<Input
										id="email"
										type="email"
										value={field.state.value ?? ""}
										onChange={(e) => field.handleChange(e.target.value)}
										className={
											errorMsg
												? "border-destructive focus-visible:ring-destructive/20"
												: ""
										}
									/>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="phone">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="phone">Phone Number</Label>
								<Input
									id="phone"
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="address">
						{(field) => (
							<div className="space-y-2 md:col-span-2">
								<Label htmlFor="address">Street Address</Label>
								<Input
									id="address"
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="city">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="city">City</Label>
								<Input
									id="city"
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			<div className="flex justify-end gap-4">
				<Button type="button" variant="outline" onClick={() => router.back()}>
					Cancel
				</Button>
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit || mutation.isPending || isSubmitting}
						>
							{mutation.isPending || isSubmitting
								? "Saving..."
								: "Save Changes"}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
