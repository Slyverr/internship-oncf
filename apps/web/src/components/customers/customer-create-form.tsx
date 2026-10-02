"use client";

import { CUSTOMER_ICE_LENGTH, CUSTOMER_ICE_PATTERN } from "@ecommand/shared";
import { useForm } from "@tanstack/react-form-nextjs";
import { useRouter } from "next/navigation";
import { type JSX, useMemo } from "react";
import { FormFieldHeader } from "@/components/common/form-field-header";
import {
	GuidedFormActions,
	GuidedFormProgress,
} from "@/components/common/guided-form";
import { PageHeader } from "@/components/common/page-header";
import { CustomerTypeSelect } from "@/components/customers/customer-type-select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useGuidedFormState } from "@/hooks/use-guided-form-state";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { useCustomersControllerCreate } from "@/lib/api/customers";
import type { CustomerDetailDto } from "@/lib/api/generated.schemas";
import {
	type CustomerFormValues,
	createCustomerFormSchema,
} from "./customer-form";

export function CustomerCreateForm(): JSX.Element {
	const router = useRouter();
	const mutation = useCustomersControllerCreate();
	const t = useTranslate();
	const getErrorMessage = useFormErrorMessage();
	const { schema, identitySchema, steps } = useMemo(
		() => createCustomerFormSchema(t),
		[t],
	);
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
			companyName: "",
			customerCode: "",
			ice: "",
			address: "",
			city: "",
			phone: "",
			email: "",
			typeId: "",
		} as CustomerFormValues,
		onSubmit: async ({ value }) => {
			if (!validate(schema.safeParse(value))) {
				return;
			}

			mutation.mutate(
				{
					data: {
						companyName: value.companyName.trim(),
						...(value.customerCode?.trim()
							? { customerCode: value.customerCode.trim() }
							: {}),
						...(value.ice?.trim() ? { ice: value.ice.trim() } : {}),
						...(value.address?.trim() ? { address: value.address.trim() } : {}),
						...(value.city?.trim() ? { city: value.city.trim() } : {}),
						...(value.phone?.trim() ? { phone: value.phone.trim() } : {}),
						...(value.email?.trim() ? { email: value.email.trim() } : {}),
						...(value.typeId?.trim() ? { typeId: value.typeId.trim() } : {}),
					},
				},
				{
					onSuccess: (customer: CustomerDetailDto) => {
						router.push(`/dashboard/customers/${customer.id}`);
					},
				},
			);
		},
	});

	function continueToContact() {
		const result = identitySchema.safeParse(form.state.values);
		advanceIfValid(result);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				if (step === 0) {
					continueToContact();
					return;
				}
				form.handleSubmit();
			}}
			className="workspace-form"
		>
			<PageHeader
				title={t(Messages.customers.createTitle)}
				description={t(Messages.customers.createDescription)}
			/>
			<GuidedFormProgress steps={steps} currentStep={step} />

			<Card
				hidden={step !== 0}
				className={step === 0 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>{t(Messages.customers.form.company)}</CardTitle>
					<CardDescription>
						{t(Messages.customers.form.companyDescription)}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<form.Field name="companyName">
						{(field) => {
							const errorMsg =
								stepErrors.companyName ??
								getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="companyName"
										label={t(Messages.customers.form.companyName)}
										required
										error={errorMsg}
									/>
									<Input
										id="companyName"
										placeholder={t(
											Messages.customers.form.companyNamePlaceholder,
										)}
										value={field.state.value}
										onChange={(e) => {
											field.handleChange(e.target.value);
											clearFieldError("companyName");
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

					<form.Field name="customerCode">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="customerCode">
									{t(Messages.customers.form.customerCode)}
								</Label>
								<Input
									id="customerCode"
									placeholder={t(
										Messages.customers.form.customerCodePlaceholder,
									)}
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="ice">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="customer-ice">
									{t(Messages.customers.form.ice)}
								</Label>
								<Input
									id="customer-ice"
									inputMode="numeric"
									maxLength={CUSTOMER_ICE_LENGTH}
									pattern={CUSTOMER_ICE_PATTERN.source}
									placeholder={t(Messages.customers.form.icePlaceholder)}
									value={field.state.value ?? ""}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
								<p className="text-meta text-muted-foreground">
									{t(Messages.customers.form.iceHint)}
								</p>
							</div>
						)}
					</form.Field>

					<form.Field name="typeId">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="typeId">
									{t(Messages.customers.form.type)}
								</Label>
								<CustomerTypeSelect
									id="typeId"
									value={field.state.value ?? ""}
									onChange={field.handleChange}
								/>
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
					<CardTitle>{t(Messages.customers.form.contact)}</CardTitle>
					<CardDescription>
						{t(Messages.customers.form.contactDescription)}
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
										label={t(Messages.customers.form.email)}
										error={errorMsg}
									/>
									<Input
										id="email"
										type="email"
										placeholder={t(Messages.customers.form.emailPlaceholder)}
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
							<div className="oncf-field">
								<Label htmlFor="phone">
									{t(Messages.customers.form.phone)}
								</Label>
								<Input
									id="phone"
									placeholder={t(Messages.customers.form.phonePlaceholder)}
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="address">
						{(field) => (
							<div className="oncf-field @3xl/workspace:col-span-2">
								<Label htmlFor="address">
									{t(Messages.customers.form.address)}
								</Label>
								<Input
									id="address"
									placeholder={t(Messages.customers.form.addressPlaceholder)}
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="city">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="city">{t(Messages.customers.form.city)}</Label>
								<Input
									id="city"
									placeholder={t(Messages.customers.form.cityPlaceholder)}
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
						onCancel={() => router.push("/dashboard/customers")}
						onPrevious={() => setStep(0)}
						onContinue={continueToContact}
						submitLabel={t(Messages.customers.form.create)}
						pendingLabel={t(Messages.customers.form.creating)}
						isSubmitting={state.isSubmitting}
						isPending={mutation.isPending}
						isSubmitDisabled={!state.canSubmit}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
