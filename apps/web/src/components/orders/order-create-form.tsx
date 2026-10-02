"use client";

import { OrderStatus, Permission } from "@ecommand/shared";
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
import { CustomerSelect } from "@/components/customers/customer-select";
import { GoodSelect } from "@/components/goods/good-select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UnitSelect } from "@/components/units/unit-select";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { useGuidedFormState } from "@/hooks/use-guided-form-state";
import { Messages, type TypedMessageTranslator } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerCreate } from "@/lib/api/orders";
import { useAuth } from "@/providers/auth-provider";
import { OrderStatusSelect } from "./order-status-select";

function createOrderSchema(t: TypedMessageTranslator) {
	return z.object({
		customerId: z
			.number()
			.int()
			.positive(t(Messages.orders.createForm.validation.customerRequired)),
		goodsId: z
			.number()
			.int()
			.positive(t(Messages.orders.createForm.validation.goodsRequired)),
		unitId: z.uuid(t(Messages.orders.createForm.validation.unitRequired)),
		quantityDemanded: z
			.string()
			.trim()
			.min(1, t(Messages.orders.createForm.validation.quantityRequired))
			.refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
				message: t(Messages.orders.createForm.validation.quantityPositive),
			}),
		status: z
			.enum(Object.values(OrderStatus) as [OrderStatus, ...OrderStatus[]])
			.optional(),
		supervisor: z.string().optional(),
		remarks: z.string().optional(),
		orderDate: z.string().optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
	});
}

function getOrderSteps(t: TypedMessageTranslator) {
	return [
		{
			title: t(Messages.orders.createForm.steps.details),
			description: t(Messages.orders.createForm.steps.customerAndGoods),
		},
		{
			title: t(Messages.orders.createForm.steps.schedule),
			description: t(Messages.orders.createForm.steps.datesAndInstructions),
		},
	];
}

type CreateOrderFormValues = z.infer<ReturnType<typeof createOrderSchema>>;

export function OrderCreateForm(): JSX.Element {
	const router = useRouter();
	const { profile, hasPermission } = useAuth();
	const mutation = useOrdersControllerCreate();
	const t = useTranslate();
	const getErrorMessage = useFormErrorMessage();
	const { schema, basicsSchema, managedBasicsSchema, steps } = useMemo(() => {
		const schema = createOrderSchema(t);
		return {
			schema,
			basicsSchema: schema.pick({
				goodsId: true,
				unitId: true,
				quantityDemanded: true,
			}),
			managedBasicsSchema: schema.pick({
				customerId: true,
				goodsId: true,
				unitId: true,
				quantityDemanded: true,
			}),
			steps: getOrderSteps(t),
		};
	}, [t]);

	const canManageOther = hasPermission(Permission.ORDERS_MANAGE_OTHER);
	const canManageStatus = hasPermission(Permission.ORDERS_MANAGE_STATUS);
	const {
		step,
		setStep,
		stepErrors,
		advanceIfValid,
		clearFieldError,
		validate,
	} = useGuidedFormState();

	function continueToSchedule() {
		const validationSchema = canManageOther
			? managedBasicsSchema
			: basicsSchema;
		const result = validationSchema.safeParse(form.state.values);
		advanceIfValid(result);
	}

	const defaultValues: CreateOrderFormValues = {
		customerId: profile?.customerId ?? 0,
		goodsId: 0,
		unitId: "",
		quantityDemanded: "",
		status: canManageStatus ? OrderStatus.DRAFT : undefined,
		supervisor: "",
		remarks: "",
		orderDate: "",
		startDate: "",
		endDate: "",
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
						customerId: value.customerId,
						goodsId: value.goodsId,
						unitId: value.unitId,
						quantityDemanded: value.quantityDemanded,
						...(value.status ? { status: value.status } : {}),
						...(value.supervisor?.trim()
							? { supervisor: value.supervisor.trim() }
							: {}),
						...(value.remarks?.trim() ? { remarks: value.remarks.trim() } : {}),
						...(value.orderDate ? { orderDate: value.orderDate } : {}),
						...(value.startDate ? { startDate: value.startDate } : {}),
						...(value.endDate ? { endDate: value.endDate } : {}),
					},
				},
				{
					onSuccess: (order: OrderDetailDto) => {
						router.push(`/dashboard/orders/${order.orderNumber}`);
					},
				},
			);
		},
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				if (step === 0) {
					continueToSchedule();
					return;
				}
				form.handleSubmit();
			}}
			className="workspace-form"
		>
			<PageHeader
				title={t(Messages.orders.createForm.title)}
				description={t(Messages.orders.createForm.description)}
			/>
			<GuidedFormProgress steps={steps} currentStep={step} />

			<section
				key={step}
				aria-labelledby={
					step === 0 ? "order-details-title" : "order-schedule-title"
				}
				className="page-enter grid w-full gap-4"
			>
				{step === 0 && (
					<Card>
						<CardHeader>
							<CardTitle id="order-details-title">
								{t(Messages.orders.createForm.steps.details)}
							</CardTitle>
							<CardDescription>
								{t(Messages.orders.createForm.chooseDetails)}
							</CardDescription>
						</CardHeader>

						<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
							{canManageOther && (
								<form.Field name="customerId">
									{(field) => {
										const errorMsg =
											stepErrors.customerId ??
											getErrorMessage(field.state.meta.errors[0]);
										return (
											<div className="oncf-field">
												<FormFieldHeader
													htmlFor="customerId"
													label={t(Messages.orders.createForm.customerCompany)}
													required
													error={errorMsg}
												/>
												<div className={errorMsg ? "oncf-invalid-control" : ""}>
													<CustomerSelect
														id="customerId"
														value={
															field.state.value > 0
																? field.state.value
																: undefined
														}
														onChange={(value) => {
															field.handleChange(value);
															clearFieldError("customerId");
														}}
													/>
												</div>
											</div>
										);
									}}
								</form.Field>
							)}

							<form.Field name="goodsId">
								{(field) => {
									const errorMsg =
										stepErrors.goodsId ??
										getErrorMessage(field.state.meta.errors[0]);
									return (
										<div className="oncf-field">
											<FormFieldHeader
												htmlFor="goodsId"
												label={t(Messages.orders.createForm.goods)}
												required
												error={errorMsg}
											/>
											<div className={errorMsg ? "oncf-invalid-control" : ""}>
												<GoodSelect
													id="goodsId"
													value={
														field.state.value > 0
															? field.state.value
															: undefined
													}
													onChange={(value) => {
														field.handleChange(value);
														clearFieldError("goodsId");
													}}
												/>
											</div>
										</div>
									);
								}}
							</form.Field>

							<form.Field name="unitId">
								{(field) => {
									const errorMsg =
										stepErrors.unitId ??
										getErrorMessage(field.state.meta.errors[0]);
									return (
										<div className="oncf-field">
											<FormFieldHeader
												htmlFor="unitId"
												label={t(Messages.orders.createForm.unit)}
												required
												error={errorMsg}
											/>
											<div className={errorMsg ? "oncf-invalid-control" : ""}>
												<UnitSelect
													id="unitId"
													value={field.state.value}
													onChange={(value) => {
														field.handleChange(value);
														clearFieldError("unitId");
													}}
												/>
											</div>
										</div>
									);
								}}
							</form.Field>

							<form.Field name="quantityDemanded">
								{(field) => {
									const errorMsg =
										stepErrors.quantityDemanded ??
										getErrorMessage(field.state.meta.errors[0]);
									return (
										<div className="oncf-field">
											<FormFieldHeader
												htmlFor="quantityDemanded"
												label={t(Messages.orders.createForm.quantity)}
												required
												error={errorMsg}
											/>
											<Input
												id="quantityDemanded"
												placeholder={t(
													Messages.orders.createForm.quantityPlaceholder,
												)}
												className={
													errorMsg
														? "border-destructive focus-visible:ring-destructive/20"
														: ""
												}
												value={field.state.value}
												onChange={(event) => {
													field.handleChange(event.target.value);
													clearFieldError("quantityDemanded");
												}}
											/>
										</div>
									);
								}}
							</form.Field>
						</CardContent>
					</Card>
				)}

				{step === 1 && (
					<>
						<Card>
							<CardHeader>
								<CardTitle id="order-schedule-title">
									{t(Messages.orders.createForm.scheduleTitle)}
								</CardTitle>
								<CardDescription>
									{t(Messages.orders.createForm.scheduleDescription)}
								</CardDescription>
							</CardHeader>

							<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
								<form.Field name="supervisor">
									{(field) => (
										<div className="oncf-field">
											<Label htmlFor="supervisor">
												{t(Messages.orders.createForm.supervisor)}
											</Label>
											<Input
												id="supervisor"
												placeholder={t(
													Messages.orders.createForm.supervisorPlaceholder,
												)}
												value={field.state.value ?? ""}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</div>
									)}
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
														label={t(Messages.orders.createForm.initialStatus)}
														error={errorMsg}
													/>
													<div
														className={errorMsg ? "oncf-invalid-control" : ""}
													>
														<OrderStatusSelect
															value={field.state.value}
															onChange={(value) => field.handleChange(value)}
														/>
													</div>
												</div>
											);
										}}
									</form.Field>
								)}
								<form.Field name="orderDate">
									{(field) => (
										<div className="oncf-field">
											<Label htmlFor="orderDate">
												{t(Messages.orders.createForm.orderDate)}
											</Label>
											<Input
												id="orderDate"
												type="date"
												value={field.state.value ?? ""}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="startDate">
									{(field) => (
										<div className="oncf-field">
											<Label htmlFor="startDate">
												{t(Messages.orders.createForm.transportStart)}
											</Label>
											<Input
												id="startDate"
												type="date"
												value={field.state.value ?? ""}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</div>
									)}
								</form.Field>

								<form.Field name="endDate">
									{(field) => (
										<div className="oncf-field">
											<Label htmlFor="endDate">
												{t(Messages.orders.createForm.completionTarget)}
											</Label>
											<Input
												id="endDate"
												type="date"
												value={field.state.value ?? ""}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</div>
									)}
								</form.Field>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>
									{t(Messages.orders.createForm.additionalInformation)}
								</CardTitle>
								<CardDescription>
									{t(
										Messages.orders.createForm.additionalInformationDescription,
									)}
								</CardDescription>
							</CardHeader>

							<CardContent>
								<form.Field name="remarks">
									{(field) => (
										<div className="oncf-field">
											<Label htmlFor="remarks">
												{t(Messages.orders.createForm.remarksAndNotes)}
											</Label>
											<Textarea
												id="remarks"
												placeholder={t(
													Messages.orders.createForm.remarksPlaceholder,
												)}
												value={field.state.value ?? ""}
												onChange={(event) =>
													field.handleChange(event.target.value)
												}
											/>
										</div>
									)}
								</form.Field>
							</CardContent>
						</Card>
					</>
				)}
			</section>

			<form.Subscribe>
				{(state: typeof form.state) => (
					<GuidedFormActions
						currentStep={step}
						stepCount={steps.length}
						onCancel={() => router.push("/dashboard/orders")}
						onPrevious={() => setStep(0)}
						onContinue={continueToSchedule}
						submitLabel={t(Messages.orders.createForm.create)}
						pendingLabel={t(Messages.orders.createForm.creating)}
						isSubmitting={state.isSubmitting}
						isPending={mutation.isPending}
						isSubmitDisabled={!state.canSubmit}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
