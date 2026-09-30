"use client";

import { Permission, ProgramStatus } from "@ecommand/shared";
import { useForm } from "@tanstack/react-form-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type JSX, useEffect, useState } from "react";
import { z } from "zod";
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
import { useGuidedFormState } from "@/hooks/use-guided-form-state";
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerFindEligibleForPrograms } from "@/lib/api/orders";
import { useProgramsControllerCreate } from "@/lib/api/programs";
import { useUsersControllerFindAll } from "@/lib/api/users";
import { getFormErrorMessage } from "@/lib/form-utils";
import { getEligibleOrderId } from "@/lib/program-creation-eligibility";
import { useAuth } from "@/providers/auth-provider";
import { ProgramStatusSelect } from "./program-status-select";

const createProgramSchema = z.object({
	orderId: z.number().int().positive("Order is required"),
	userId: z.number().int().positive("User is required").optional(),
	status: z
		.enum(Object.values(ProgramStatus) as [ProgramStatus, ...ProgramStatus[]])
		.optional(),
	plannedDate: z.string().min(1, "Planned date is required"),
	quantityPlanned: z
		.string()
		.trim()
		.min(1, "Planned quantity is required")
		.refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
			message: "Quantity must be a positive number",
		}),
	quantityRealized: z
		.string()
		.optional()
		.refine(
			(value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0),
			{
				message: "Quantity must be a non-negative number",
			},
		),
	dtmStatus: z.string().optional(),
});

type CreateProgramFormValues = z.infer<typeof createProgramSchema>;

const programPlanningSchema = createProgramSchema.pick({
	orderId: true,
	plannedDate: true,
	quantityPlanned: true,
});
const programSteps = [
	{ title: "Plan", description: "Order and planned quantity" },
	{ title: "Execution", description: "Initial progress details" },
];

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
			if (!validate(createProgramSchema.safeParse(value))) {
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
		const result = programPlanningSchema.safeParse(form.state.values);
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
				title="New program"
				description="Plan the work for an eligible order, then record its execution."
			/>
			<GuidedFormProgress steps={programSteps} currentStep={step} />

			<Card
				hidden={step !== 0}
				className={step === 0 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>Program Information</CardTitle>
					<CardDescription>
						Specify the order, responsible user, planned date, and planned
						quantity for the program.
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<form.Field name="orderId">
						{(field) => {
							const errorMsg =
								stepErrors.orderId ??
								getFormErrorMessage(field.state.meta.errors[0]);

							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="orderId"
										label="Order"
										required
										error={errorMsg}
									/>
									<div className={errorMsg ? "oncf-invalid-control" : ""}>
										<OrderSelect
											id="orderId"
											orders={orders}
											emptyMessage="No eligible orders are ready for planning."
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
													No orders are currently eligible for program planning.
													A program can be created once an order reaches an
													eligible status.
												</p>
												<div className="flex flex-wrap gap-2">
													<Link
														href="/dashboard/orders"
														className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
													>
														Review orders
													</Link>
													{canCreateOrders && (
														<Link
															href="/dashboard/orders/new"
															className="inline-flex min-h-11 items-center rounded-md px-4 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
														>
															Create an order
														</Link>
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
									getFormErrorMessage(field.state.meta.errors[0]);

								return (
									<div className="oncf-field">
										<FormFieldHeader
											htmlFor="userId"
											label="Responsible User"
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
									getFormErrorMessage(field.state.meta.errors[0]);

								return (
									<div className="oncf-field">
										<FormFieldHeader
											htmlFor="status"
											label="Initial Status Override"
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
								getFormErrorMessage(field.state.meta.errors[0]);

							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="plannedDate"
										label="Planned Date"
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
								getFormErrorMessage(field.state.meta.errors[0]);

							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="quantityPlanned"
										label="Quantity Planned"
										required
										error={errorMsg}
									/>
									<Input
										id="quantityPlanned"
										placeholder="e.g. 500"
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
					<CardTitle>Execution</CardTitle>
					<CardDescription>
						Record realized quantity and the current DTM status when applicable.
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<form.Field name="quantityRealized">
						{(field) => {
							const errorMsg =
								stepErrors.quantityRealized ??
								getFormErrorMessage(field.state.meta.errors[0]);

							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="quantityRealized"
										label="Quantity Realized"
										error={errorMsg}
									/>
									<Input
										id="quantityRealized"
										placeholder="e.g. 450"
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
								<Label htmlFor="dtmStatus">DTM Status</Label>
								<Input
									id="dtmStatus"
									placeholder="DTM status"
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
						stepCount={programSteps.length}
						onCancel={() =>
							initialOrderNumber
								? router.push(`/dashboard/orders/${initialOrderNumber}`)
								: router.push("/dashboard/programs")
						}
						onPrevious={() => setStep(0)}
						onContinue={continueToExecution}
						submitLabel="Create Program"
						pendingLabel="Creating Program..."
						isSubmitting={state.isSubmitting}
						isPending={mutation.isPending}
						isSubmitDisabled={!state.canSubmit}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
