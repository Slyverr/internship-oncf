"use client";

import { useForm } from "@tanstack/react-form-nextjs";
import { useRouter } from "next/navigation";
import { type JSX } from "react";
import { z } from "zod";
import { FormFieldHeader } from "@/components/common/form-field-header";
import {
	GuidedFormActions,
	GuidedFormProgress,
} from "@/components/common/guided-form";
import { PageHeader } from "@/components/common/page-header";
import { CustomerSelect } from "@/components/customers/customer-select";
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
import { useGuidedFormState } from "@/hooks/use-guided-form-state";
import {
	UpdateUserDtoRole,
	UpdateUserDtoType,
	type UserDetailDto,
} from "@/lib/api/generated.schemas";
import { useUsersControllerUpdate } from "@/lib/api/users";
import { getFormErrorMessage } from "@/lib/form-utils";
import { formatUserRole, formatUserType } from "@/lib/user-labels";

const updateUserSchemaBase = z.object({
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
	employeeCode: z.string().max(50).optional(),
	type: z.nativeEnum(UpdateUserDtoType).optional(),
	customerId: z.number().int().positive().optional(),
});

const updateUserSchema = updateUserSchemaBase.superRefine(
	({ role, customerId }, context) => {
		if (
			role === UpdateUserDtoRole.CLIENT_REPRESENTATIVE &&
			(!customerId || customerId < 1)
		) {
			context.addIssue({
				code: "custom",
				path: ["customerId"],
				message: "Select the customer this representative belongs to",
			});
		}
	},
);

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

const userAccessSchema = updateUserSchemaBase.pick({
	email: true,
	role: true,
	type: true,
});
const userEditSteps = [
	{ title: "Access", description: "Email and role settings" },
	{ title: "Profile", description: "Name and employee code" },
];

export function UserEditForm({ user }: { user: UserDetailDto }): JSX.Element {
	const router = useRouter();
	const mutation = useUsersControllerUpdate();
	const {
		step,
		setStep,
		stepErrors,
		advanceIfValid,
		clearFieldError,
		validate,
	} = useGuidedFormState();

	const form = useForm({
		defaultValues: {
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role:
				(user.role?.name as UpdateUserDtoRole | undefined) ??
				UpdateUserDtoRole.AGENT_COMMERCIAL,
			employeeCode: user.employeeCode ?? "",
			type: (user.type as UpdateUserDtoType) ?? UpdateUserDtoType.internal,
			customerId: user.customerId ?? undefined,
		} as UpdateUserFormValues,
		onSubmit: async ({ value }) => {
			if (!validate(updateUserSchema.safeParse(value))) {
				return;
			}

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
						...(value.employeeCode?.trim()
							? { employeeCode: value.employeeCode.trim() }
							: {}),
						...(value.type ? { type: value.type } : {}),
						...(value.customerId ? { customerId: value.customerId } : {}),
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

	function continueToProfile() {
		const result = userAccessSchema.safeParse(form.state.values);
		advanceIfValid(result);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				if (step === 0) {
					continueToProfile();
					return;
				}
				form.handleSubmit();
			}}
			className="workspace-form"
		>
			<PageHeader
				title="Edit user"
				description="Update account access and profile information."
			/>
			<GuidedFormProgress steps={userEditSteps} currentStep={step} />

			<Card
				hidden={step !== 0}
				className={step === 0 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>Account Access</CardTitle>
					<CardDescription>
						Update login email and access settings.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<form.Field name="email">
						{(field) => {
							const errorMsg =
								stepErrors.email ??
								getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="email"
										label="Email Address"
										required
										error={errorMsg}
									/>
									<Input
										id="email"
										type="email"
										placeholder="name@company.com"
										value={field.state.value}
										onChange={(e) => {
											field.handleChange(e.target.value);
											clearFieldError("email");
										}}
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
							<div className="oncf-field">
								<Label htmlFor="role">User Role</Label>
								<Select
									value={field.state.value}
									onValueChange={(val) =>
										field.handleChange(val as UpdateUserDtoRole)
									}
								>
									<SelectTrigger id="role">
										<SelectValue>
											{formatUserRole(field.state.value)}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={UpdateUserDtoRole.ADMIN}>
											{formatUserRole(UpdateUserDtoRole.ADMIN)}
										</SelectItem>
										<SelectItem value={UpdateUserDtoRole.AGENT_COMMERCIAL}>
											{formatUserRole(UpdateUserDtoRole.AGENT_COMMERCIAL)}
										</SelectItem>
										<SelectItem value={UpdateUserDtoRole.CLIENT_REPRESENTATIVE}>
											{formatUserRole(UpdateUserDtoRole.CLIENT_REPRESENTATIVE)}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					<form.Field name="type">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="type">User Type</Label>
								<Select
									value={field.state.value}
									onValueChange={(val) =>
										field.handleChange(val as UpdateUserDtoType)
									}
								>
									<SelectTrigger id="type">
										<SelectValue>
											{formatUserType(field.state.value)}
										</SelectValue>
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
				</CardContent>
			</Card>

			<Card
				hidden={step !== 1}
				className={step === 1 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>Profile</CardTitle>
					<CardDescription>
						Update the user name and employee code.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<form.Field name="firstName">
						{(field) => {
							const errorMsg =
								stepErrors.firstName ??
								getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="firstName"
										label="First Name"
										required
										error={errorMsg}
									/>
									<Input
										id="firstName"
										placeholder="e.g. Samira"
										value={field.state.value}
										onChange={(e) => {
											field.handleChange(e.target.value);
											clearFieldError("firstName");
										}}
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
							const errorMsg =
								stepErrors.lastName ??
								getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="lastName"
										label="Last Name"
										required
										error={errorMsg}
									/>
									<Input
										id="lastName"
										placeholder="e.g. El Amrani"
										value={field.state.value}
										onChange={(e) => {
											field.handleChange(e.target.value);
											clearFieldError("lastName");
										}}
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

					<form.Subscribe selector={(state) => state.values.role}>
						{(role) =>
							role === UpdateUserDtoRole.CLIENT_REPRESENTATIVE && (
								<form.Field name="customerId">
									{(field) => {
										const errorMsg =
											stepErrors.customerId ??
											getFormErrorMessage(field.state.meta.errors[0]);

										return (
											<div className="oncf-field @3xl/workspace:col-span-2">
												<FormFieldHeader
													htmlFor="customerId"
													label="Customer Company"
													required
													error={errorMsg}
												/>
												<CustomerSelect
													id="customerId"
													value={field.state.value}
													onChange={(value) => {
														field.handleChange(value);
														clearFieldError("customerId");
													}}
												/>
											</div>
										);
									}}
								</form.Field>
							)
						}
					</form.Subscribe>

					<form.Field name="employeeCode">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="employeeCode">Employee code</Label>
								<Input
									id="employeeCode"
									placeholder="Employee code"
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			<form.Subscribe>
				{(state: typeof form.state) => (
					<GuidedFormActions
						currentStep={step}
						stepCount={userEditSteps.length}
						onCancel={() => router.push(`/dashboard/users/${user.id}`)}
						onPrevious={() => setStep(0)}
						onContinue={continueToProfile}
						submitLabel="Save Changes"
						pendingLabel="Saving..."
						isSubmitting={state.isSubmitting}
						isPending={mutation.isPending}
						isSubmitDisabled={!state.canSubmit}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
