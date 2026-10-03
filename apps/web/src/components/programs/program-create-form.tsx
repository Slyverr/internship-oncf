"use client";

import { Permission, ProgramStatus } from "@ecommand/shared";
import { useForm } from "@tanstack/react-form-nextjs";
import { useRouter } from "next/navigation";
import { type JSX, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { ActionLink } from "@/components/common/action-link";
import { FormFieldHeader } from "@/components/common/form-field-header";
import {
	GuidedFormActions,
	GuidedFormProgress,
} from "@/components/common/guided-form";
import { PageHeader } from "@/components/common/page-header";
import { OrderSelect } from "@/components/orders/order-select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserSelect } from "@/components/users/user-select";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useGuidedFormState } from "@/hooks/use-guided-form-state";
import { Messages, type TypedMessageTranslator } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerFindEligibleForPrograms } from "@/lib/api/orders";
import { useProgramsControllerCreate } from "@/lib/api/programs";
import { useUsersControllerFindAll } from "@/lib/api/users";
import { getEligibleOrderId } from "@/lib/program-creation-eligibility";
import { useAuth } from "@/providers/auth-provider";
import { ProgramStatusSelect } from "./program-status-select";

function createProgramSchema(t: TypedMessageTranslator) {
	return z.object({
		orderId: z
			.number()
			.int()
			.positive(t(Messages.programs.createForm.validation.orderRequired)),
		userId: z
			.number()
			.int()
			.positive(t(Messages.programs.createForm.validation.userRequired))
			.optional(),
		status: z
			.enum(Object.values(ProgramStatus) as [ProgramStatus, ...ProgramStatus[]])
			.optional(),
		plannedDate: z
			.string()
			.min(1, t(Messages.programs.createForm.validation.plannedDateRequired)),
		quantityPlanned: z
			.string()
			.trim()
			.min(
				1,
				t(Messages.programs.createForm.validation.plannedQuantityRequired),
			)
			.refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
				message: t(Messages.programs.createForm.validation.quantityPositive),
			}),
		quantityRealized: z
			.string()
			.optional()
			.refine(
				(value) =>
					!value || (!Number.isNaN(Number(value)) && Number(value) >= 0),
				{
					message: t(
						Messages.programs.createForm.validation.quantityNonNegative,
					),
				},
			),
		dtmStatus: z.string().optional(),
	});
}

function getProgramSteps(t: TypedMessageTranslator) {
	return [
		{
			title: t(Messages.programs.steps.plan),
			description: t(Messages.programs.steps.orderQuantity),
		},
		{
			title: t(Messages.programs.steps.execution),
			description: t(Messages.programs.steps.progress),
		},
	];
}

type CreateProgramFormValues = z.infer<ReturnType<typeof createProgramSchema>>;

export function ProgramCreateForm({
	initialOrderNumber,
	initialOrderSearch,
}: {
	initialOrderNumber?: string;
	initialOrderSearch?: string;
}): JSX.Element {
	const router = useRouter();
	const { profile, hasPermission } = useAuth();
	const mutation = useProgramsControllerCreate();
	const t = useTranslate();
	const getErrorMessage = useFormErrorMessage();
	const { schema, planningSchema, steps } = useMemo(() => {
		const schema = createProgramSchema(t);
		return {
			schema,
			planningSchema: schema.pick({
				orderId: true,
				plannedDate: true,
				quantityPlanned: true,
			}),
			steps: getProgramSteps(t),
		};
	}, [t]);
	const [initialOrderResolved, setInitialOrderResolved] = useState(false);

	const canCreateOrders = hasPermission(Permission.ORDERS_CREATE);
	const canManageOther = hasPermission(Permission.PROGRAMS_MANAGE_OTHER);
	const canManageStatus = hasPermission(Permission.PROGRAMS_MANAGE_STATUS);
	const {
		step,
		setStep,
		stepErrors,
		advanceIfValid,
		clearFieldError,
		validate,
	} = useGuidedFormState();

	const defaultValues: CreateProgramFormValues = {
		orderId: 0,
		userId: canManageOther ? undefined : profile?.id,
		status: canManageStatus ? ProgramStatus.DRAFT : undefined,
		plannedDate: "",
		quantityPlanned: "",
		quantityRealized: "",
		dtmStatus: "",
	};

	const form = useForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			if (!validate(schema.safeParse(value))) {
				return;
			}

			mutation.mutate(
				{
					data: {
						orderId: value.orderId,
						...(value.userId ? { userId: value.userId } : {}),
						...(value.status ? { status: value.status } : {}),
						plannedDate: value.plannedDate,
						quantityPlanned: value.quantityPlanned,
						...(value.quantityRealized
							? { quantityRealized: value.quantityRealized }
							: {}),
						...(value.dtmStatus?.trim()
							? { dtmStatus: value.dtmStatus.trim() }
							: {}),
					},
				},
				{
					onSuccess: (program: ProgramDetailDto) => {
						router.push(`/dashboard/programs/${program.programNumber}`);
					},
				},
			);
		},
	});

	function continueToExecution() {
		const result = planningSchema.safeParse(form.state.values);
		advanceIfValid(result);
	}

	const {
		data: orders = [],
		isLoading: ordersIsLoading,
		isError: ordersIsError,
		isFetching: ordersIsFetching,
		refetch: retryOrders,
	} = useOrdersControllerFindEligibleForPrograms(
		initialOrderSearch ? { search: initialOrderSearch } : {},
	);

	useEffect(() => {
		if (
			!initialOrderNumber ||
			initialOrderResolved ||
			ordersIsLoading ||
			ordersIsFetching ||
			ordersIsError
		)
			return;

		form.setFieldValue(
			"orderId",
			getEligibleOrderId(initialOrderNumber, orders),
		);
		setInitialOrderResolved(true);
	}, [
		form,
		initialOrderNumber,
		initialOrderResolved,
		orders,
		ordersIsError,
		ordersIsFetching,
		ordersIsLoading,
	]);

	const {
		data: users = [],
		isLoading: usersIsLoading,
		isError: usersIsError,
		isFetching: usersIsFetching,
		refetch: retryUsers,
	} = useUsersControllerFindAll({});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				if (step === 0) {
					continueToExecution();
					return;
				}
				form.handleSubmit();
			}}
			className="workspace-form"
		>
			<PageHeader
				title={t(Messages.programs.createTitle)}
				description={t(Messages.programs.createDescription)}
			/>
			<GuidedFormProgress steps={steps} currentStep={step} />

			<Card
				hidden={step !== 0}
				className={step === 0 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>{t(Messages.programs.createForm.information)}</CardTitle>
					<CardDescription>
						{t(Messages.programs.createForm.description)}
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<form.Field name="orderId">
						{(field) => {
							const errorMsg =
								stepErrors.orderId ??
								getErrorMessage(field.state.meta.errors[0]);

							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="orderId"
										label={t(Messages.programs.createForm.order)}
										required
										error={errorMsg}
									/>
									<div className={errorMsg ? "oncf-invalid-control" : ""}>
										<OrderSelect
											id="orderId"
											orders={orders}
											emptyMessage={t(
												Messages.programs.createForm.noEligibleOrders,
											)}
											value={
												field.state.value > 0 ? field.state.value : undefined
											}
											onChange={(value) => {
												field.handleChange(value);
												clearFieldError("orderId");
											}}
											isLoading={ordersIsLoading}
											isError={ordersIsError}
											isFetching={ordersIsFetching}
											onRetry={() => void retryOrders()}
										/>
									</div>
									{!ordersIsLoading &&
										!ordersIsError &&
										orders.length === 0 && (
											<div className="grid gap-2 rounded-md border bg-muted/30 p-4">
												<p
													role="status"
													className="text-sm text-muted-foreground"
												>
													{t(
														Messages.programs.createForm.noEligibleDescription,
													)}
												</p>
												<div className="flex flex-wrap gap-2">
													<ActionLink href="/dashboard/orders">
														{t(Messages.programs.createForm.reviewOrders)}
													</ActionLink>
													{canCreateOrders && (
														<ActionLink href="/dashboard/orders/new">
															{t(Messages.programs.createForm.createOrder)}
														</ActionLink>
													)}
												</div>
											</div>
										)}
								</div>
							);
						}}
					</form.Field>

					{canManageOther && (
						<form.Field name="userId">
							{(field) => {
								const errorMsg =
									stepErrors.userId ??
									getErrorMessage(field.state.meta.errors[0]);

								return (
									<div className="oncf-field">
										<FormFieldHeader
											htmlFor="userId"
											label={t(Messages.programs.createForm.responsibleUser)}
											error={errorMsg}
										/>
										<div className={errorMsg ? "oncf-invalid-control" : ""}>
											<UserSelect
												id="userId"
												users={users}
												value={field.state.value}
												onChange={(value) => field.handleChange(value)}
												isLoading={usersIsLoading}
												isError={usersIsError}
												isFetching={usersIsFetching}
												onRetry={() => void retryUsers()}
											/>
										</div>
									</div>
								);
							}}
						</form.Field>
					)}

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
											label={t(Messages.programs.createForm.initialStatus)}
											error={errorMsg}
										/>
										<div className={errorMsg ? "oncf-invalid-control" : ""}>
											<ProgramStatusSelect
												id="status"
												value={field.state.value}
												onChange={(value) => field.handleChange(value)}
											/>
										</div>
									</div>
								);
							}}
						</form.Field>
					)}

					<form.Field name="plannedDate">
						{(field) => {
							const errorMsg =
								stepErrors.plannedDate ??
								getErrorMessage(field.state.meta.errors[0]);

							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="plannedDate"
										label={t(Messages.programs.createForm.plannedDate)}
										required
										error={errorMsg}
									/>
									<Input
										id="plannedDate"
										type="date"
										className={
											errorMsg
												? "border-destructive focus-visible:ring-destructive/20"
												: ""
										}
										value={field.state.value}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearFieldError("plannedDate");
										}}
									/>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="quantityPlanned">
						{(field) => {
							const errorMsg =
								stepErrors.quantityPlanned ??
								getErrorMessage(field.state.meta.errors[0]);

							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="quantityPlanned"
										label={t(Messages.programs.createForm.quantityPlanned)}
										required
										error={errorMsg}
									/>
									<Input
										id="quantityPlanned"
										placeholder={t(
											Messages.programs.createForm.quantityPlannedPlaceholder,
										)}
										className={
											errorMsg
												? "border-destructive focus-visible:ring-destructive/20"
												: ""
										}
										value={field.state.value}
										onChange={(event) => {
											field.handleChange(event.target.value);
											clearFieldError("quantityPlanned");
										}}
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
					<CardTitle>{t(Messages.programs.createForm.execution)}</CardTitle>
					<CardDescription>
						{t(Messages.programs.createForm.executionDescription)}
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<form.Field name="quantityRealized">
						{(field) => {
							const errorMsg =
								stepErrors.quantityRealized ??
								getErrorMessage(field.state.meta.errors[0]);

							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="quantityRealized"
										label={t(Messages.programs.createForm.quantityRealized)}
										error={errorMsg}
									/>
									<Input
										id="quantityRealized"
										placeholder={t(
											Messages.programs.createForm.quantityRealizedPlaceholder,
										)}
										className={
											errorMsg
												? "border-destructive focus-visible:ring-destructive/20"
												: ""
										}
										value={field.state.value ?? ""}
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="dtmStatus">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="dtmStatus">
									{t(Messages.programs.createForm.dtmStatus)}
								</Label>
								<Input
									id="dtmStatus"
									placeholder={t(
										Messages.programs.createForm.dtmStatusPlaceholder,
									)}
									value={field.state.value ?? ""}
									onChange={(event) => field.handleChange(event.target.value)}
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
						onCancel={() =>
							initialOrderNumber
								? router.push(`/dashboard/orders/${initialOrderNumber}`)
								: router.push("/dashboard/programs")
						}
						onPrevious={() => setStep(0)}
						onContinue={continueToExecution}
						submitLabel={t(Messages.programs.createForm.create)}
						pendingLabel={t(Messages.programs.createForm.creating)}
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
