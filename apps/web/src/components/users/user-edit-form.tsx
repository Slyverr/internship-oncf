"use client";

import { RolePersona } from "@ecommand/shared";
import { useForm } from "@tanstack/react-form-nextjs";
import { useRouter } from "next/navigation";
import { type JSX, useMemo } from "react";
import { z } from "zod";
import { FormFieldHeader } from "@/components/common/form-field-header";
import {
	GuidedFormActions,
	GuidedFormProgress,
} from "@/components/common/guided-form";
import { PageHeader } from "@/components/common/page-header";
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
import { CustomerPortfolioField } from "@/components/users/customer-portfolio-field";
import { RoleProfileSelect } from "@/components/users/role-profile-select";
import { UserCustomerSelect } from "@/components/users/user-customer-select";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useGuidedFormState } from "@/hooks/use-guided-form-state";
import { Messages, type TypedMessageTranslator } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import {
	UpdateUserDtoType,
	type UserDetailDto,
} from "@/lib/api/generated.schemas";
import { useRolesControllerFindProfiles } from "@/lib/api/roles";
import { useUsersControllerUpdate } from "@/lib/api/users";
import { formatUserType } from "@/lib/user-labels";

function createUpdateUserSchemaBase(t: TypedMessageTranslator) {
	return z.object({
		email: z
			.string()
			.email(t(Messages.users.form.validation.validEmail))
			.max(100)
			.optional(),
		firstName: z
			.string()
			.trim()
			.min(1, t(Messages.users.form.validation.firstNameRequired))
			.max(100)
			.optional(),
		lastName: z
			.string()
			.trim()
			.min(1, t(Messages.users.form.validation.lastNameRequired))
			.max(100)
			.optional(),
		roleId: z.string().uuid().optional(),
		employeeCode: z.string().max(50).optional(),
		type: z.nativeEnum(UpdateUserDtoType).optional(),
		customerId: z.number().int().positive().optional(),
		customerIds: z.array(z.number().int().positive()).optional(),
	});
}

type UpdateUserFormValues = z.infer<
	ReturnType<typeof createUpdateUserSchemaBase>
>;

function getUserEditSteps(t: TypedMessageTranslator) {
	return [
		{
			title: t(Messages.users.form.steps.access),
			description: t(Messages.users.form.steps.accessDescription),
		},
		{
			title: t(Messages.users.form.steps.profile),
			description: t(Messages.users.form.steps.profileDescription),
		},
	];
}

export function UserEditForm({ user }: { user: UserDetailDto }): JSX.Element {
	const router = useRouter();
	const t = useTranslate();
	const locale = useLocale();
	const getErrorMessage = useFormErrorMessage();
	const mutation = useUsersControllerUpdate();
	const roleProfilesQuery = useRolesControllerFindProfiles();
	const roleProfiles = (roleProfilesQuery.data ?? []).filter(
		(profile) => profile.isActive,
	);
	const { baseSchema, accessSchema, steps } = useMemo(() => {
		const baseSchema = createUpdateUserSchemaBase(t);
		return {
			baseSchema,
			accessSchema: baseSchema.pick({ email: true, roleId: true, type: true }),
			steps: getUserEditSteps(t),
		};
	}, [t]);
	const {
		step,
		setStep,
		stepErrors,
		advanceIfValid,
		clearFieldError,
		validate,
	} = useGuidedFormState();
	const updateUserSchema = useMemo(
		() =>
			baseSchema.superRefine(({ roleId, customerId }, context) => {
				const selectedProfile = roleProfiles.find(({ id }) => id === roleId);
				if (
					selectedProfile?.persona === RolePersona.CLIENT_REPRESENTATIVE &&
					(!customerId || customerId < 1)
				) {
					context.addIssue({
						code: "custom",
						path: ["customerId"],
						message: t(Messages.users.form.validation.customerRequired),
					});
				}
			}),
		[baseSchema, roleProfiles, t],
	);

	const form = useForm({
		defaultValues: {
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			roleId: user.roleId,
			employeeCode: user.employeeCode ?? "",
			type: (user.type as UpdateUserDtoType) ?? UpdateUserDtoType.internal,
			customerId: user.customerId ?? undefined,
			customerIds: user.userCustomers.map(({ customerId }) => customerId),
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
						...(value.roleId && value.roleId !== user.roleId
							? { roleId: value.roleId }
							: {}),
						...(value.employeeCode?.trim()
							? { employeeCode: value.employeeCode.trim() }
							: {}),
						...(value.type ? { type: value.type } : {}),
						...(value.customerId ? { customerId: value.customerId } : {}),
						...(roleProfiles.find(({ id }) => id === value.roleId)?.persona ===
						RolePersona.AGENT_COMMERCIAL
							? { customerIds: value.customerIds ?? [] }
							: {}),
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
		const result = accessSchema.safeParse(form.state.values);
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
				title={t(Messages.users.editTitle)}
				description={t(Messages.users.editDescription)}
			/>
			<GuidedFormProgress steps={steps} currentStep={step} />

			<Card
				hidden={step !== 0}
				className={step === 0 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>{t(Messages.users.form.sections.access)}</CardTitle>
					<CardDescription>
						{t(Messages.users.form.sections.accessDescription)}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<form.Field name="email">
						{(field) => {
							const errorMsg =
								stepErrors.email ?? getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="email"
										label={t(Messages.users.form.fields.email)}
										required
										error={errorMsg}
									/>
									<Input
										id="email"
										type="email"
										placeholder={t(Messages.users.form.fields.emailPlaceholder)}
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

					<form.Field name="roleId">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="roleId">
									{t(Messages.users.form.fields.role)}
								</Label>
								<RoleProfileSelect
									profiles={roleProfiles}
									value={field.state.value ?? ""}
									onValueChange={field.handleChange}
									disabled={roleProfilesQuery.isLoading}
								/>
								{roleProfilesQuery.isError && (
									<p className="text-sm text-destructive">
										{t(Messages.users.form.rolesLoadFailed)}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="type">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="type">
									{t(Messages.users.form.fields.type)}
								</Label>
								<Select
									value={field.state.value}
									onValueChange={(val) =>
										field.handleChange(val as UpdateUserDtoType)
									}
								>
									<SelectTrigger id="type">
										<SelectValue>
											{formatUserType(field.state.value, locale)}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={UpdateUserDtoType.internal}>
											{formatUserType(UpdateUserDtoType.internal, locale)}
										</SelectItem>
										<SelectItem value={UpdateUserDtoType.external}>
											{formatUserType(UpdateUserDtoType.external, locale)}
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
					<CardTitle>{t(Messages.users.form.sections.profileEdit)}</CardTitle>
					<CardDescription>
						{t(Messages.users.form.sections.profileEditDescription)}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<form.Field name="firstName">
						{(field) => {
							const errorMsg =
								stepErrors.firstName ??
								getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="firstName"
										label={t(Messages.users.form.fields.firstName)}
										required
										error={errorMsg}
									/>
									<Input
										id="firstName"
										placeholder={t(
											Messages.users.form.fields.firstNamePlaceholder,
										)}
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
								getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="lastName"
										label={t(Messages.users.form.fields.lastName)}
										required
										error={errorMsg}
									/>
									<Input
										id="lastName"
										placeholder={t(
											Messages.users.form.fields.lastNamePlaceholder,
										)}
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

					<form.Subscribe selector={(state) => state.values.roleId}>
						{(roleId) =>
							roleProfiles.find(({ id }) => id === roleId)?.persona ===
								RolePersona.CLIENT_REPRESENTATIVE && (
								<form.Field name="customerId">
									{(field) => {
										const errorMsg =
											stepErrors.customerId ??
											getErrorMessage(field.state.meta.errors[0]);

										return (
											<div className="oncf-field @3xl/workspace:col-span-2">
												<FormFieldHeader
													htmlFor="customerId"
													label={t(Messages.users.form.fields.customer)}
													required
													error={errorMsg}
												/>
												<UserCustomerSelect
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

					<form.Subscribe selector={(state) => state.values.roleId}>
						{(roleId) =>
							roleProfiles.find(({ id }) => id === roleId)?.persona ===
								RolePersona.AGENT_COMMERCIAL && (
								<form.Field name="customerIds">
									{(field) => (
										<CustomerPortfolioField
											value={field.state.value ?? []}
											onChange={field.handleChange}
										/>
									)}
								</form.Field>
							)
						}
					</form.Subscribe>

					<form.Field name="employeeCode">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="employeeCode">
									{t(Messages.users.form.fields.employeeCode)}
								</Label>
								<Input
									id="employeeCode"
									placeholder={t(
										Messages.users.form.fields.employeeCodePlaceholder,
									)}
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
						stepCount={steps.length}
						onCancel={() => router.push(`/dashboard/users/${user.id}`)}
						onPrevious={() => setStep(0)}
						onContinue={continueToProfile}
						submitLabel={t(Messages.users.form.actions.save)}
						pendingLabel={t(Messages.users.form.actions.saving)}
						isSubmitting={state.isSubmitting}
						isPending={mutation.isPending}
						isSubmitDisabled={!state.canSubmit}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
