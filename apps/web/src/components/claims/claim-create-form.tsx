"use client";

import {
	ClaimPriority,
	ClaimStatus,
	ClaimType,
	Permission,
} from "@ecommand/shared";
import { useForm } from "@tanstack/react-form-nextjs";
import { useRouter } from "next/navigation";
import { type JSX, useState } from "react";
import { z } from "zod";
import { ClaimPrioritySelect } from "@/components/claims/claim-priority-select";
import { ClaimStatusSelect } from "@/components/claims/claim-status-select";
import { FormFieldHeader } from "@/components/common/form-field-header";
import {
	GuidedFormActions,
	GuidedFormProgress,
} from "@/components/common/guided-form";
import { PageHeader } from "@/components/common/page-header";
import { CustomerSelect } from "@/components/customers/customer-select";
import { OrderSelect } from "@/components/orders/order-select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useGuidedFormState } from "@/hooks/use-guided-form-state";
import { Messages } from "@/i18n";
import { getClaimTypeLabel } from "@/i18n/claim-labels";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { useClaimsControllerCreate } from "@/lib/api/claims";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerFindAll } from "@/lib/api/orders";
import { useAuth } from "@/providers/auth-provider";

export function createClaimSchema(t: ReturnType<typeof useTranslate>) {
	return z.object({
		customerId: z
			.number()
			.int()
			.positive({
				message: t(Messages.claims.validation.customerRequired),
			}),
		type: z.enum(ClaimType, {
			error: t(Messages.claims.validation.typeRequired),
		}),
		description: z
			.string()
			.trim()
			.min(10, {
				message: t(Messages.claims.validation.descriptionTooShort),
			}),
		userId: z.number().int().optional(),
		orderId: z.number().int().optional(),
		operationId: z
			.uuid({ message: t(Messages.claims.validation.operationInvalid) })
			.optional()
			.or(z.literal("")),
		priority: z.enum(ClaimPriority).optional(),
		status: z.enum(ClaimStatus).optional(),
		resolution: z
			.string()
			.max(1000, {
				message: t(Messages.claims.validation.resolutionTooLong),
			})
			.optional(),
	});
}

type CreateClaimFormValues = z.infer<ReturnType<typeof createClaimSchema>>;
export function ClaimCreateForm(): JSX.Element {
	const locale = useLocale();
	const t = useTranslate();
	const getErrorMessage = useFormErrorMessage();
	const claimSchema = createClaimSchema(t);
	const claimBasicsSchema = claimSchema.pick({ customerId: true, type: true });
	const router = useRouter();
	const { profile, hasPermission } = useAuth();
	const mutation = useClaimsControllerCreate();
	const claimSteps = [
		{
			title: t(Messages.claims.details),
			description: t(Messages.claims.customerAndType),
		},
		{
			title: t(Messages.claims.descriptionStep),
			description: t(Messages.claims.explainIssue),
		},
	];
	const [selectedCustomerId, setSelectedCustomerId] = useState(
		profile?.customerId ?? 0,
	);

	const canManageOther = hasPermission(Permission.CLAIMS_MANAGE_OTHER);
	const canManageStatus = hasPermission(Permission.CLAIMS_MANAGE_STATUS);
	const {
		step,
		setStep,
		stepErrors,
		advanceIfValid,
		clearFieldError,
		validate,
	} = useGuidedFormState();

	const defaultValues: CreateClaimFormValues = {
		customerId: profile?.customerId ?? 0,
		type: ClaimType.OTHER,
		orderId: undefined,
		operationId: "",
		priority: ClaimPriority.MEDIUM,
		status: canManageStatus ? ClaimStatus.NEW : undefined,
		description: "",
		resolution: "",
	};

	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			if (!validate(claimSchema.safeParse(value))) {
				return;
			}

			mutation.mutate(
				{
					data: {
						customerId: value.customerId,
						type: value.type as ClaimType,
						description: value.description.trim(),
						...(value.orderId ? { orderId: value.orderId } : {}),
						...(value.operationId ? { operationId: value.operationId } : {}),
						...(value.priority
							? { priority: value.priority as ClaimPriority }
							: {}),
						...(value.status ? { status: value.status as ClaimStatus } : {}),
						...(value.resolution?.trim()
							? { resolution: value.resolution.trim() }
							: {}),
					},
				},
				{
					onSuccess: (claim: ClaimDetailDto) => {
						router.push(`/dashboard/claims/${claim.claimNumber}`);
					},
				},
			);
		},
	});

	function continueToDescription() {
		const result = claimBasicsSchema.safeParse(form.state.values);
		advanceIfValid(result);
	}

	const {
		data: orders = [],
		isLoading: ordersIsLoading,
		isError: ordersIsError,
		isFetching: ordersIsFetching,
		refetch: retryOrders,
	} = useOrdersControllerFindAll(
		selectedCustomerId > 0
			? { customerId: selectedCustomerId, limit: 100 }
			: undefined,
		{ query: { enabled: selectedCustomerId > 0 } },
	);
	const canCreateClaims = hasPermission(Permission.CLAIMS_CREATE);

	if (!canCreateClaims) {
		return (
			<p role="alert" className="text-sm text-muted-foreground">
				{t(Messages.claims.noCreatePermission)}
			</p>
		);
	}

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				if (step === 0) {
					continueToDescription();
					return;
				}
				form.handleSubmit();
			}}
			className="workspace-form"
		>
			<PageHeader
				title={t(Messages.claims.newTitle)}
				description={t(Messages.claims.newDescription)}
			/>
			<GuidedFormProgress steps={claimSteps} currentStep={step} />

			<Card
				hidden={step !== 0}
				className={step === 0 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>{t(Messages.claims.information)}</CardTitle>
					<CardDescription>
						{t(Messages.claims.informationDescription)}
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					{canManageOther && (
						<form.Field name="customerId">
							{(field) => {
								const errorMsg = getErrorMessage(
									stepErrors.customerId ?? field.state.meta.errors[0],
								);
								return (
									<div className="oncf-field">
										<FormFieldHeader
											htmlFor="customerId"
											label={t(Messages.claims.customerCompany)}
											required
											error={errorMsg}
										/>
										<div className={errorMsg ? "oncf-invalid-control" : ""}>
											<CustomerSelect
												id="customerId"
												value={
													field.state.value > 0 ? field.state.value : undefined
												}
												onChange={(value) => {
													field.handleChange(value);
													if (field.state.value !== value) {
														form.setFieldValue("orderId", undefined);
													}
													setSelectedCustomerId(value);
													clearFieldError("customerId");
												}}
											/>
										</div>
									</div>
								);
							}}
						</form.Field>
					)}

					<form.Field name="type">
						{(field) => {
							const errorMsg =
								stepErrors.type ?? getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="type"
										label={t(Messages.claims.claimType)}
										required
										error={errorMsg}
									/>
									<Select
										value={field.state.value}
										onValueChange={(val) => {
											field.handleChange(val as ClaimType);
											clearFieldError("type");
										}}
									>
										<SelectTrigger className="w-full">
											<SelectValue>
												{field.state.value
													? getClaimTypeLabel(field.state.value, locale)
													: t(Messages.claims.selectType)}
											</SelectValue>
										</SelectTrigger>
										<SelectContent>
											{Object.values(ClaimType).map((typeVal) => (
												<SelectItem key={typeVal} value={typeVal}>
													{getClaimTypeLabel(typeVal, locale)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="orderId">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="orderId">
									{t(Messages.claims.associatedOrderOptional)}
								</Label>
								<OrderSelect
									id="orderId"
									orders={orders}
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									emptyMessage={t(Messages.claims.noOrdersForCustomer)}
									isLoading={ordersIsLoading}
									isError={ordersIsError}
									isFetching={ordersIsFetching}
									onRetry={() => void retryOrders()}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="priority">
						{(field) => {
							const errorMsg =
								stepErrors.priority ??
								getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="priority"
										label={t(Messages.claims.priority)}
										error={errorMsg}
									/>
									<ClaimPrioritySelect
										value={field.state.value as ClaimPriority | undefined}
										onChange={(val) => field.handleChange(val)}
									/>
								</div>
							);
						}}
					</form.Field>

					{canManageStatus && (
						<form.Field name="status">
							{(field) => {
								const errorMsg =
									stepErrors.status ??
									getErrorMessage(field.state.meta.errors[0]);
								return (
									<div className="oncf-field">
										<FormFieldHeader
											htmlFor="status"
											label={t(Messages.claims.initialStatusOverride)}
											error={errorMsg}
										/>
										<ClaimStatusSelect
											value={field.state.value as ClaimStatus | undefined}
											onChange={(val) => field.handleChange(val)}
										/>
									</div>
								);
							}}
						</form.Field>
					)}
				</CardContent>
			</Card>

			<Card
				hidden={step !== 1}
				className={step === 1 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>{t(Messages.claims.issueResolution)}</CardTitle>
					<CardDescription>{t(Messages.claims.describeIssue)}</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<form.Field name="description">
						{(field) => {
							const errorMsg =
								stepErrors.description ??
								getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="description"
										label={t(Messages.claims.claimDescription)}
										required
										error={errorMsg}
									/>
									<Textarea
										id="description"
										placeholder={t(Messages.claims.claimDescriptionPlaceholder)}
										rows={4}
										className={
											errorMsg
												? "border-destructive focus-visible:ring-destructive/20"
												: ""
										}
										value={field.state.value}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearFieldError("description");
										}}
									/>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="resolution">
						{(field) => {
							const errorMsg =
								stepErrors.resolution ??
								getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="resolution"
										label={t(Messages.claims.initialResolution)}
										error={errorMsg}
									/>
									<Textarea
										id="resolution"
										placeholder={t(
											Messages.claims.initialResolutionPlaceholder,
										)}
										rows={3}
										className={
											errorMsg
												? "border-destructive focus-visible:ring-destructive/20"
												: ""
										}
										value={field.state.value ?? ""}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearFieldError("resolution");
										}}
									/>
								</div>
							);
						}}
					</form.Field>
				</CardContent>
			</Card>

			<form.Subscribe>
				{(state: typeof form.state) => (
					<GuidedFormActions
						currentStep={step}
						stepCount={claimSteps.length}
						onCancel={() => router.push("/dashboard/claims")}
						onPrevious={() => setStep((current) => Math.max(current - 1, 0))}
						onContinue={continueToDescription}
						submitLabel={t(Messages.claims.created)}
						pendingLabel={t(Messages.claims.createPending)}
						isSubmitting={state.isSubmitting}
						isPending={mutation.isPending}
						isSubmitDisabled={!state.canSubmit}
						errorMessage={
							mutation.isError ? getErrorMessage(mutation.error) : undefined
						}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
