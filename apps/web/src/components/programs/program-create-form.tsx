"use client";

import { Permission, ProgramStatus } from "@ecommand/shared";
import { useForm } from "@tanstack/react-form-nextjs";
import { useRouter } from "next/navigation";
import { type JSX, useState } from "react";
import { z } from "zod";
import { FormFieldHeader } from "@/components/common/form-field-header";
import {
	GuidedFormActions,
	GuidedFormProgress,
} from "@/components/common/guided-form";
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
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerFindEligibleForPrograms } from "@/lib/api/orders";
import { useProgramsControllerCreate } from "@/lib/api/programs";
import { useUsersControllerFindAll } from "@/lib/api/users";
import {
	getFormErrorMessage,
	getFormStepErrors,
	omitFormStepError,
} from "@/lib/form-utils";
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

export function ProgramCreateForm(): JSX.Element {
	const router = useRouter();
	const { profile, hasPermission } = useAuth();
	const mutation = useProgramsControllerCreate();

	const canManageOther = hasPermission(Permission.PROGRAMS_MANAGE_OTHER);
	const canManageStatus = hasPermission(Permission.PROGRAMS_MANAGE_STATUS);
	const [step, setStep] = useState(0);
	const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

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
		validators: {
			onChange: createProgramSchema,
		},
		onSubmit: async ({ value }) => {
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
						router.push(`/dashboard/programs/${program.id}`);
					},
				},
			);
		},
	});

	function continueToExecution() {
		const result = programPlanningSchema.safeParse(form.state.values);
		if (!result.success) {
			setStepErrors(getFormStepErrors(result.error.issues));
			return;
		}

		setStepErrors({});
		setStep(1);
	}

	const { data: orders = [], isLoading: ordersIsLoading } =
		useOrdersControllerFindEligibleForPrograms({});

	const { data: users = [], isLoading: usersIsLoading } =
		useUsersControllerFindAll({});

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
			className="space-y-4"
		>
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

				<CardContent className="grid gap-4 md:grid-cols-2">
					<form.Field name="orderId">
						{(field) => {
							const errorMsg =
								stepErrors.orderId ??
								getFormErrorMessage(field.state.meta.errors[0]);

							return (
								<div className="space-y-2">
									<FormFieldHeader
										htmlFor="orderId"
										label="Order"
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
										<OrderSelect
											orders={orders}
											value={
												field.state.value > 0 ? field.state.value : undefined
											}
											onChange={(value) => {
												field.handleChange(value);
												setStepErrors((errors) =>
													omitFormStepError(errors, "orderId"),
												);
											}}
											isLoading={ordersIsLoading}
										/>
									</div>
								</div>
							);
						}}
					</form.Field>

					{canManageOther && (
						<form.Field name="userId">
							{(field) => {
								const errorMsg = getFormErrorMessage(
									field.state.meta.errors[0],
								);

								return (
									<div className="space-y-2">
										<FormFieldHeader
											htmlFor="userId"
											label="Responsible User"
											error={errorMsg}
										/>
										<div
											className={
												errorMsg
													? "[&>button]:border-destructive [&>button]:focus:ring-destructive/20"
													: ""
											}
										>
											<UserSelect
												users={users}
												value={field.state.value}
												onChange={(value) => field.handleChange(value)}
												isLoading={usersIsLoading}
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
								const errorMsg = getFormErrorMessage(
									field.state.meta.errors[0],
								);

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
											<ProgramStatusSelect
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
								<div className="space-y-2">
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
											setStepErrors((errors) =>
												omitFormStepError(errors, "plannedDate"),
											);
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
								<div className="space-y-2">
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
											setStepErrors((errors) =>
												omitFormStepError(errors, "quantityPlanned"),
											);
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

				<CardContent className="grid gap-4 md:grid-cols-2">
					<form.Field name="quantityRealized">
						{(field) => {
							const errorMsg = getFormErrorMessage(field.state.meta.errors[0]);

							return (
								<div className="space-y-2">
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
							<div className="space-y-2">
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
						onCancel={() => router.back()}
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
