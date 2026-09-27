"use client";

import { OrderStatus, Permission } from "@ecommand/shared";
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
import { useGuidedFormState } from "@/hooks/use-guided-form-state";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerCreate } from "@/lib/api/orders";
import { getFormErrorMessage } from "@/lib/form-utils";
import { useAuth } from "@/providers/auth-provider";
import { OrderStatusSelect } from "./order-status-select";

const createOrderSchema = z.object({
	customerId: z.number().int().positive("Customer is required"),
	goodsId: z.number().int().positive("Goods selection is required"),
	unitId: z.uuid("Unit selection is required"),
	quantityDemanded: z
		.string()
		.trim()
		.min(1, "Quantity demanded is required")
		.refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
			message: "Quantity must be a positive number",
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

const orderSteps = [
	{ title: "Order details", description: "Customer and goods" },
	{ title: "Schedule", description: "Dates and instructions" },
];

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

const orderBasicsSchema = createOrderSchema.pick({
	goodsId: true,
	unitId: true,
	quantityDemanded: true,
});
const managedOrderBasicsSchema = createOrderSchema.pick({
	customerId: true,
	goodsId: true,
	unitId: true,
	quantityDemanded: true,
});

export function OrderCreateForm(): JSX.Element {
	const router = useRouter();
	const { profile, hasPermission } = useAuth();
	const mutation = useOrdersControllerCreate();

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
		const schema = canManageOther
			? managedOrderBasicsSchema
			: orderBasicsSchema;
		const result = schema.safeParse(form.state.values);
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
			if (!validate(createOrderSchema.safeParse(value))) {
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
						router.push(`/dashboard/orders/${order.id}`);
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
			className="max-w-5xl space-y-4"
		>
			<PageHeader
				title="New order"
				description="Enter the customer, goods, quantity, and schedule for this order."
			/>
			<GuidedFormProgress steps={orderSteps} currentStep={step} />

			<section
				key={step}
				aria-labelledby={
					step === 0 ? "order-details-title" : "order-schedule-title"
				}
				className="page-enter grid max-w-5xl gap-4"
			>
				{step === 0 && (
					<Card>
						<CardHeader>
							<CardTitle id="order-details-title">Order details</CardTitle>
							<CardDescription>
								Choose who the order is for, what is being transported, and the
								requested quantity.
							</CardDescription>
						</CardHeader>

						<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
							{canManageOther && (
								<form.Field name="customerId">
									{(field) => {
										const errorMsg =
											stepErrors.customerId ??
											getFormErrorMessage(field.state.meta.errors[0]);
										return (
											<div className="space-y-2">
												<FormFieldHeader
													htmlFor="customerId"
													label="Customer Company"
													required
													error={errorMsg}
												/>
												<div
													className={
														errorMsg
															? "[&>button]:border-destructive [&>button]:focus:ring-destructive/20"
															: ""
													}
												>
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
										getFormErrorMessage(field.state.meta.errors[0]);
									return (
										<div className="space-y-2">
											<FormFieldHeader
												htmlFor="goodsId"
												label="Goods / Commodity"
												required
												error={errorMsg}
											/>
											<div
												className={
													errorMsg
														? "[&>button]:border-destructive [&>button]:focus:ring-destructive/20"
														: ""
												}
											>
												<GoodSelect
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
										getFormErrorMessage(field.state.meta.errors[0]);
									return (
										<div className="space-y-2">
											<FormFieldHeader
												htmlFor="unitId"
												label="Unit of Measurement"
												required
												error={errorMsg}
											/>
											<div
												className={
													errorMsg
														? "[&>button]:border-destructive [&>button]:focus:ring-destructive/20"
														: ""
												}
											>
												<UnitSelect
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
										getFormErrorMessage(field.state.meta.errors[0]);
									return (
										<div className="space-y-2">
											<FormFieldHeader
												htmlFor="quantityDemanded"
												label="Quantity Demanded"
												required
												error={errorMsg}
											/>
											<Input
												id="quantityDemanded"
												placeholder="e.g. 500"
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
									Schedule and handling
								</CardTitle>
								<CardDescription>
									Add optional dates and operational details. You can leave
									fields blank and update them later.
								</CardDescription>
							</CardHeader>

							<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
								<form.Field name="supervisor">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="supervisor">Supervisor Name</Label>
											<Input
												id="supervisor"
												placeholder="Name of supervisor"
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
												getFormErrorMessage(field.state.meta.errors[0]);
											return (
												<div className="space-y-2">
													<FormFieldHeader
														htmlFor="status"
														label="Initial Status Override"
														error={errorMsg}
													/>
													<div
														className={
															errorMsg
																? "[&>button]:border-destructive [&>button]:focus:ring-destructive/20"
																: ""
														}
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
										<div className="space-y-2">
											<Label htmlFor="orderDate">Order Date</Label>
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
										<div className="space-y-2">
											<Label htmlFor="startDate">Planned Transport Start</Label>
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
										<div className="space-y-2">
											<Label htmlFor="endDate">Planned Completion Target</Label>
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
								<CardTitle>Additional Information</CardTitle>
								<CardDescription>
									Attach optional handling instructions or station-level notes.
								</CardDescription>
							</CardHeader>

							<CardContent>
								<form.Field name="remarks">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor="remarks">
												Remarks & Operational Notes
											</Label>
											<Textarea
												id="remarks"
												placeholder="Enter any additional instructions or remarks..."
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
						stepCount={orderSteps.length}
						onCancel={() => router.push("/dashboard/orders")}
						onPrevious={() => setStep(0)}
						onContinue={continueToSchedule}
						submitLabel="Create Order"
						pendingLabel="Creating Order..."
						isSubmitting={state.isSubmitting}
						isPending={mutation.isPending}
						isSubmitDisabled={!state.canSubmit}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
