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
	CreateUserDtoRole,
	CreateUserDtoType,
	type UserDetailDto,
} from "@/lib/api/generated.schemas";
import { useUsersControllerCreate } from "@/lib/api/users";
import { getFormErrorMessage } from "@/lib/form-utils";

const createUserSchemaBase = z.object({
	email: z.email("Valid email is required").max(100),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(255),
	firstName: z.string().trim().min(1, "First name is required").max(100),
	lastName: z.string().trim().min(1, "Last name is required").max(100),
	role: z.enum(CreateUserDtoRole, { message: "Role is required" }),
	employeeId: z.string().max(50).optional(),
	type: z.enum(CreateUserDtoType).optional(),
	customerId: z.number().optional(),
	agencyId: z.number().optional(),
});

const createUserSchema = createUserSchemaBase.superRefine(
	({ role, customerId }, context) => {
		if (
			role === CreateUserDtoRole.CLIENT_REPRESENTATIVE &&
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

type CreateUserFormValues = z.infer<typeof createUserSchema>;

const userCredentialsSchema = createUserSchemaBase.pick({
	email: true,
	password: true,
});
const userSteps = [
	{ title: "Credentials", description: "Email and password" },
	{ title: "Profile", description: "Name and role" },
];

export function UserCreateForm(): JSX.Element {
	const router = useRouter();
	const mutation = useUsersControllerCreate();
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
			email: "",
			password: "",
			firstName: "",
			lastName: "",
			role: CreateUserDtoRole.AGENT_COMMERCIAL,
			customerId: undefined,
			employeeId: "",
			type: CreateUserDtoType.internal,
		} as CreateUserFormValues,
		onSubmit: async ({ value }) => {
			if (!validate(createUserSchema.safeParse(value))) {
				return;
			}

			mutation.mutate(
				{
					data: {
						email: value.email.trim(),
						password: value.password,
						firstName: value.firstName.trim(),
						lastName: value.lastName.trim(),
						role: value.role,
						...(value.employeeId?.trim()
							? { employeeId: value.employeeId.trim() }
							: {}),
						...(value.type ? { type: value.type } : {}),
						...(value.customerId ? { customerId: value.customerId } : {}),
						...(value.agencyId ? { agencyId: value.agencyId } : {}),
					},
				},
				{
					onSuccess: (user: UserDetailDto) => {
						router.push(`/dashboard/users/${user.id}`);
					},
				},
			);
		},
	});

	function continueToProfile() {
		const result = userCredentialsSchema.safeParse(form.state.values);
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
			className="space-y-4"
		>
			<GuidedFormProgress steps={userSteps} currentStep={step} />

			<Card
				hidden={step !== 0}
				className={step === 0 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>Account Credentials</CardTitle>
					<CardDescription>Primary login email and password.</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<form.Field name="email">
						{(field) => {
							const errorMsg =
								stepErrors.email ??
								getFormErrorMessage(field.state.meta.errors[0]);
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
										placeholder="user@oncf.ma"
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

					<form.Field name="password">
						{(field) => {
							const errorMsg =
								stepErrors.password ??
								getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FormFieldHeader
										htmlFor="password"
										label="Password"
										required
										error={errorMsg}
									/>
									<Input
										id="password"
										type="password"
										placeholder="••••••••"
										value={field.state.value}
										onChange={(e) => {
											field.handleChange(e.target.value);
											clearFieldError("password");
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
				</CardContent>
			</Card>

			<Card
				hidden={step !== 1}
				className={step === 1 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>Personal Information & Role</CardTitle>
					<CardDescription>
						Name, role assignments, and identifiers.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<form.Field name="firstName">
						{(field) => {
							const errorMsg =
								stepErrors.firstName ??
								getFormErrorMessage(field.state.meta.errors[0]);
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
										placeholder="John"
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
								<div className="space-y-2">
									<FormFieldHeader
										htmlFor="lastName"
										label="Last Name"
										required
										error={errorMsg}
									/>
									<Input
										id="lastName"
										placeholder="Doe"
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

					<form.Field name="role">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="role">User Role *</Label>
								<Select
									value={field.state.value}
									onValueChange={(val) =>
										field.handleChange(val as CreateUserDtoRole)
									}
								>
									<SelectTrigger id="role">
										<SelectValue placeholder="Select Role" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={CreateUserDtoRole.ADMIN}>
											ADMIN
										</SelectItem>
										<SelectItem value={CreateUserDtoRole.AGENT_COMMERCIAL}>
											AGENT COMMERCIAL
										</SelectItem>
										<SelectItem value={CreateUserDtoRole.CLIENT_REPRESENTATIVE}>
											CLIENT REPRESENTATIVE
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => state.values.role}>
						{(role) =>
							role === CreateUserDtoRole.CLIENT_REPRESENTATIVE && (
								<form.Field name="customerId">
									{(field) => {
										const errorMsg =
											stepErrors.customerId ??
											getFormErrorMessage(field.state.meta.errors[0]);

										return (
											<div className="space-y-2 md:col-span-2">
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

					<form.Field name="type">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="type">User Type</Label>
								<Select
									value={field.state.value}
									onValueChange={(val) =>
										field.handleChange(val as CreateUserDtoType)
									}
								>
									<SelectTrigger id="type">
										<SelectValue placeholder="Select Type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={CreateUserDtoType.internal}>
											Internal
										</SelectItem>
										<SelectItem value={CreateUserDtoType.external}>
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
									placeholder="EMP-1234"
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
						stepCount={userSteps.length}
						onCancel={() => router.push("/dashboard/users")}
						onPrevious={() => setStep(0)}
						onContinue={continueToProfile}
						submitLabel="Create User"
						pendingLabel="Creating User..."
						isSubmitting={state.isSubmitting}
						isPending={mutation.isPending}
						isSubmitDisabled={!state.canSubmit}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
