"use client";

import { useForm } from "@tanstack/react-form-nextjs";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { z } from "zod";
import { FormFieldHeader } from "@/components/common/form-field-header";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	UpdateUserDtoRole,
	UpdateUserDtoType,
	type UserDetailDto,
} from "@/lib/api/generated.schemas";
import { useUsersControllerUpdate } from "@/lib/api/users";
import { getFormErrorMessage } from "@/lib/form-utils";

const updateUserSchema = z.object({
	email: z.string().email("Valid email is required").max(100).optional(),
	firstName: z
		.string()
		.trim()
		.min(1, "First name is required")
		.max(100)
		.optional(),
	lastName: z
		.string()
		.trim()
		.min(1, "Last name is required")
		.max(100)
		.optional(),
	role: z.nativeEnum(UpdateUserDtoRole).optional(),
	employeeId: z.string().max(50).optional(),
	type: z.nativeEnum(UpdateUserDtoType).optional(),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export function UserEditForm({ user }: { user: UserDetailDto }): JSX.Element {
	const router = useRouter();
	const mutation = useUsersControllerUpdate();

	const form = useForm({
		defaultValues: {
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role:
				(user.roleId as UpdateUserDtoRole) ??
				UpdateUserDtoRole.AGENT_COMMERCIAL,
			employeeId: user.employeeId ?? "",
			type: (user.type as UpdateUserDtoType) ?? UpdateUserDtoType.internal,
		} as UpdateUserFormValues,
		validators: {
			onChange: updateUserSchema,
		},
		onSubmit: async ({ value }) => {
			mutation.mutate(
				{
					id: user.id,
					data: {
						...(value.email?.trim() ? { email: value.email.trim() } : {}),
						...(value.firstName?.trim()
							? { firstName: value.firstName.trim() }
							: {}),
						...(value.lastName?.trim()
							? { lastName: value.lastName.trim() }
							: {}),
						...(value.role ? { role: value.role } : {}),
						...(value.employeeId?.trim()
							? { employeeId: value.employeeId.trim() }
							: {}),
						...(value.type ? { type: value.type } : {}),
					},
				},
				{
					onSuccess: (updatedUser) => {
						router.push(`/dashboard/users/${updatedUser.id}`);
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
					<CardTitle>Account Details</CardTitle>
					<CardDescription>
						Update email, name, and role attributes.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<form.Field name="email">
						{(field) => {
							const errorMsg = getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FormFieldHeader
										htmlFor="email"
										label="Email Address"
										required
										error={errorMsg}
									/>
									<Input
										id="email"
										type="email"
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

					<form.Field name="role">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="role">User Role</Label>
								<Select
									value={field.state.value}
									onValueChange={(val) =>
										field.handleChange(val as UpdateUserDtoRole)
									}
								>
									<SelectTrigger id="role">
										<SelectValue placeholder="Select Role" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={UpdateUserDtoRole.ADMIN}>
											ADMIN
										</SelectItem>
										<SelectItem value={UpdateUserDtoRole.AGENT_COMMERCIAL}>
											AGENT COMMERCIAL
										</SelectItem>
										<SelectItem value={UpdateUserDtoRole.CLIENT_REPRESENTATIVE}>
											CLIENT REPRESENTATIVE
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					<form.Field name="firstName">
						{(field) => {
							const errorMsg = getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FormFieldHeader
										htmlFor="firstName"
										label="First Name"
										required
										error={errorMsg}
									/>
									<Input
										id="firstName"
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

					<form.Field name="lastName">
						{(field) => {
							const errorMsg = getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FormFieldHeader
										htmlFor="lastName"
										label="Last Name"
										required
										error={errorMsg}
									/>
									<Input
										id="lastName"
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

					<form.Field name="type">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="type">User Type</Label>
								<Select
									value={field.state.value}
									onValueChange={(val) =>
										field.handleChange(val as UpdateUserDtoType)
									}
								>
									<SelectTrigger id="type">
										<SelectValue placeholder="Select Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={UpdateUserDtoType.internal}>
											Internal
										</SelectItem>
										<SelectItem value={UpdateUserDtoType.external}>
											External
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					<form.Field name="employeeId">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="employeeId">Employee ID</Label>
								<Input
									id="employeeId"
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
				<form.Subscribe>
					{(state: typeof form.state) => (
						<Button
							type="submit"
							disabled={
								!state.canSubmit || mutation.isPending || state.isSubmitting
							}
						>
							{mutation.isPending || state.isSubmitting
								? "Saving..."
								: "Save Changes"}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
