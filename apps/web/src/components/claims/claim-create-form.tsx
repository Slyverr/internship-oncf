"use client";

import {
	ClaimPriority,
	ClaimStatus,
	ClaimType,
	Permission,
} from "@ecommand/shared";
import { useForm } from "@tanstack/react-form-nextjs";
import { useRouter } from "next/navigation";
import { type JSX } from "react";
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
import { useGuidedFormState } from "@/hooks/use-guided-form-state";
import { useClaimsControllerCreate } from "@/lib/api/claims";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerFindAll } from "@/lib/api/orders";
import { getFormErrorMessage } from "@/lib/form-utils";
import { useAuth } from "@/providers/auth-provider";

export const createClaimSchema = z.object({
	customerId: z
		.number()
		.int()
		.positive({ message: "Customer selection is required" }),
	type: z.enum(ClaimType, { error: "Claim type is required" }),
	description: z
		.string()
		.trim()
		.min(10, { message: "Description must be at least 10 characters long" }),
	userId: z.number().int().optional(),
	orderId: z.number().int().optional(),
	operationId: z
		.uuid({ message: "Invalid operation selection" })
		.optional()
		.or(z.literal("")),
	priority: z.enum(ClaimPriority).optional(),
	status: z.enum(ClaimStatus).optional(),
	resolution: z
		.string()
		.max(1000, { message: "Resolution must be at most 1000 characters" })
		.optional(),
});

type CreateClaimFormValues = z.infer<typeof createClaimSchema>;

const claimBasicsSchema = createClaimSchema.pick({
	customerId: true,
	type: true,
});
const claimSteps = [
	{ title: "Claim", description: "Customer and issue type" },
	{ title: "Association", description: "Link an order if relevant" },
	{ title: "Description", description: "Explain the issue" },
];

export function ClaimCreateForm(): JSX.Element {
	const router = useRouter();
	const { profile, hasPermission } = useAuth();
	const mutation = useClaimsControllerCreate();

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
			if (!validate(createClaimSchema.safeParse(value))) {
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
						router.push(`/dashboard/claims/${claim.id}`);
					},
				},
			);
		},
	});

	function continueToAssociation() {
		const result = claimBasicsSchema.safeParse(form.state.values);
		advanceIfValid(result);
	}

	const {
		data: orders = [],
		isLoading: ordersIsLoading,
		isError: ordersIsError,
		isFetching: ordersIsFetching,
		refetch: retryOrders,
	} = useOrdersControllerFindAll({});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				if (step === 0) {
					continueToAssociation();
					return;
				}
				if (step === 1) {
					setStep(2);
					return;
				}
				form.handleSubmit();
			}}
			className="workspace-form"
		>
			<PageHeader
				title="New claim"
				description="Record the issue, link affected records, and describe the requested resolution."
			/>
			<GuidedFormProgress steps={claimSteps} currentStep={step} />

			<Card
				hidden={step !== 0}
				className={step === 0 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>Claim Information</CardTitle>
					<CardDescription>
						Provide details regarding the customer complaint or issue ticket.
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					{canManageOther && (
						<form.Field name="customerId">
							{(field) => {
								const errorMsg = getFormErrorMessage(
									stepErrors.customerId ?? field.state.meta.errors[0],
								);
								return (
									<div className="oncf-field">
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
													field.state.value > 0 ? field.state.value : undefined
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

					<form.Field name="type">
						{(field) => {
							const errorMsg =
								stepErrors.type ??
								getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="type"
										label="Claim Type"
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
											<SelectValue placeholder="Select claim type" />
										</SelectTrigger>
										<SelectContent>
											{Object.values(ClaimType).map((typeVal) => (
												<SelectItem key={typeVal} value={typeVal}>
													{typeVal}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="priority">
						{(field) => {
							const errorMsg =
								stepErrors.priority ??
								getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="priority"
										label="Priority"
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
									getFormErrorMessage(field.state.meta.errors[0]);
								return (
									<div className="oncf-field">
										<FormFieldHeader
											htmlFor="status"
											label="Initial Status Override"
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
					<CardTitle>Associations & Scope</CardTitle>
					<CardDescription>
						Optionally link this complaint to an existing order.
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-4 @3xl/workspace:grid-cols-2">
					<form.Field name="orderId">
						{(field) => (
							<div className="oncf-field">
								<Label htmlFor="orderId">Associated Order (Optional)</Label>
								<OrderSelect
									id="orderId"
									orders={orders}
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									isLoading={ordersIsLoading}
									isError={ordersIsError}
									isFetching={ordersIsFetching}
									onRetry={() => void retryOrders()}
								/>
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			<Card
				hidden={step !== 2}
				className={step === 2 ? "page-enter" : undefined}
			>
				<CardHeader>
					<CardTitle>Issue Description & Resolution</CardTitle>
					<CardDescription>
						Describe the claim issue details thoroughly.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<form.Field name="description">
						{(field) => {
							const errorMsg =
								stepErrors.description ??
								getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="description"
										label="Claim Description"
										required
										error={errorMsg}
									/>
									<Textarea
										id="description"
										placeholder="Detailed explanation of the problem..."
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
								getFormErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="oncf-field">
									<FormFieldHeader
										htmlFor="resolution"
										label="Initial Resolution Notes"
										error={errorMsg}
									/>
									<Textarea
										id="resolution"
										placeholder="Enter initial resolution text if resolved immediately..."
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
						onContinue={step === 0 ? continueToAssociation : () => setStep(2)}
						submitLabel="Create Claim"
						pendingLabel="Creating Claim..."
						isSubmitting={state.isSubmitting}
						isPending={mutation.isPending}
						isSubmitDisabled={!state.canSubmit}
					/>
				)}
			</form.Subscribe>
		</form>
	);
}
