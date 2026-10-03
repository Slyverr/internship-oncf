"use client";

import { RolePersona } from "@ecommand/shared";
import { useForm } from "@tanstack/react-form-nextjs";
import { useRouter } from "next/navigation";
import { type JSX, useEffect, useMemo } from "react";
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
	CreateUserDtoType,
	type UserDetailDto,
} from "@/lib/api/generated.schemas";
import { useRolesControllerFindProfiles } from "@/lib/api/roles";
import { useUsersControllerCreate } from "@/lib/api/users";
import { createUserCredentialsSchema } from "@/lib/user-credentials-schema";
import { formatUserType } from "@/lib/user-labels";

function createUserSchemaBase(t: TypedMessageTranslator) {
	const credentials = createUserCredentialsSchema(t);
	return z.object({
		...credentials.shape,
		firstName: z
			.string()
			.trim()
			.min(1, t(Messages.users.form.validation.firstNameRequired))
			.max(100),
		lastName: z
			.string()
			.trim()
			.min(1, t(Messages.users.form.validation.lastNameRequired))
			.max(100),
		roleId: z.string().uuid(t(Messages.users.form.validation.roleRequired)),
		employeeCode: z.string().max(50).optional(),
		type: z.enum(CreateUserDtoType).optional(),
		customerId: z.number().optional(),
		customerIds: z.array(z.number().int().positive()),
		agencyId: z.number().optional(),
	});
}

type CreateUserFormValues = z.infer<ReturnType<typeof createUserSchemaBase>>;

function getUserSteps(t: TypedMessageTranslator) {
	return [
		{
			title: t(Messages.users.form.steps.credentials),
			description: t(Messages.users.form.steps.credentialsDescription),
		},
		{
			title: t(Messages.users.form.steps.profile),
			description: t(Messages.users.form.steps.profileDescription),
		},
	];
}
export function UserCreateForm(): JSX.Element {
	const router = useRouter();
	const t = useTranslate();
	const locale = useLocale();
	const getErrorMessage = useFormErrorMessage();
	const mutation = useUsersControllerCreate();
	const roleProfilesQuery = useRolesControllerFindProfiles();
	const roleProfiles = (roleProfilesQuery.data ?? []).filter(
		(profile) => profile.isActive,
	);
	const defaultRole =
		roleProfiles.find(
			(profile) => profile.persona === RolePersona.AGENT_COMMERCIAL,
		) ?? roleProfiles[0];
	const defaultRoleId = defaultRole?.id;
	const { baseSchema, credentialsSchema, steps } = useMemo(() => {
		const baseSchema = createUserSchemaBase(t);
		return {
			baseSchema,
			credentialsSchema: baseSchema.pick({ email: true, password: true }),
			steps: getUserSteps(t),
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
	const createUserSchema = useMemo(
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
			email: "",
			password: "",
			firstName: "",
			lastName: "",
			roleId: "",
			customerId: undefined,
			customerIds: [],
			employeeCode: "",
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
						roleId: value.roleId,
						...(value.employeeCode?.trim()
							? { employeeCode: value.employeeCode.trim() }
							: {}),
						...(value.type ? { type: value.type } : {}),
						...(value.customerId ? { customerId: value.customerId } : {}),
						...(roleProfiles.find(({ id }) => id === value.roleId)?.persona ===
						RolePersona.AGENT_COMMERCIAL
							? { customerIds: value.customerIds }
							: {}),
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
	useEffect(() => {
		if (!form.state.values.roleId && defaultRoleId) {
			form.setFieldValue("roleId", defaultRoleId);
		}
	}, [defaultRoleId, form]);

	function continueToProfile() {
		const result = credentialsSchema.safeParse(form.state.values);
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
				title={t(Messages.users.createTitle)}
				description={t(Messages.users.createDescription)}
			/>
			<GuidedFormProgress steps={steps} currentStep={step} />

			<Card
				hidden={step !== 0}
				className={step === 0 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>{t(Messages.users.form.sections.credentials)}</CardTitle>
					<CardDescription>
						{t(Messages.users.form.sections.credentialsDescription)}
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

					<form.Field name="password">
						{(field) => {
							const errorMsg =
								stepErrors.password ??
								getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="password"
										label={t(Messages.users.form.fields.password)}
										required
										error={errorMsg}
									/>
									<Input
										id="password"
										type="password"
										placeholder={t(
											Messages.users.form.fields.passwordPlaceholder,
										)}
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
					<CardTitle>{t(Messages.users.form.sections.profile)}</CardTitle>
					<CardDescription>
						{t(Messages.users.form.sections.profileDescription)}
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

					<form.Field name="roleId">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="roleId">
									{t(Messages.users.form.fields.role)} *
								</Label>
								<RoleProfileSelect
									profiles={roleProfiles}
									value={field.state.value}
									onValueChange={field.handleChange}
									disabled={
										roleProfilesQuery.isLoading && roleProfiles.length === 0
									}
									isError={roleProfilesQuery.isError}
									isFetching={roleProfilesQuery.isFetching}
									onRetry={() => void roleProfilesQuery.refetch()}
								/>
							</div>
						)}
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
											value={field.state.value}
											onChange={field.handleChange}
										/>
									)}
								</form.Field>
							)
						}
					</form.Subscribe>

					<form.Field name="type">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="type">
									{t(Messages.users.form.fields.type)}
								</Label>
								<Select
									value={field.state.value}
									onValueChange={(val) =>
										field.handleChange(val as CreateUserDtoType)
									}
								>
									<SelectTrigger id="type">
										<SelectValue>
											{formatUserType(field.state.value, locale)}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={CreateUserDtoType.internal}>
											{formatUserType(CreateUserDtoType.internal, locale)}
										</SelectItem>
										<SelectItem value={CreateUserDtoType.external}>
											{formatUserType(CreateUserDtoType.external, locale)}
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

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
						onCancel={() => router.push("/dashboard/users")}
						onPrevious={() => setStep(0)}
						onContinue={continueToProfile}
						submitLabel={t(Messages.users.form.actions.create)}
						pendingLabel={t(Messages.users.form.actions.creating)}
						isSubmitting={state.isSubmitting}
						isPending={mutation.isPending}
						isSubmitDisabled={!state.canSubmit}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
