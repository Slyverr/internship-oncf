"use client";

import {
	ClaimPriority,
	ClaimStatus,
	ClaimType,
	Permission,
} from "@ecommand/shared";
import { useForm } from "@tanstack/react-form-nextjs";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { z } from "zod";

import { ClaimPrioritySelect } from "@/components/claims/claim-priority-select";
import { ClaimStatusSelect } from "@/components/claims/claim-status-select";
import { CustomerSelect } from "@/components/customers/customer-select";
import { OrderSelect } from "@/components/orders/order-select";
import { Button } from "@/components/ui/button";
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
import { useClaimsControllerCreate } from "@/lib/api/claims";
import type { ClaimDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerFindAll } from "@/lib/api/orders";
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

function getErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	if (typeof error === "string") return error;
	if (typeof error === "object" && error !== null && "message" in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === "string") return message;
	}
	return String(error);
}

function FieldHeader({
	htmlFor,
	label,
	required,
	error,
}: {
	htmlFor: string;
	label: string;
	required?: boolean;
	error?: string;
}): JSX.Element {
	return (
		<div className="flex items-center justify-between gap-2">
			<Label htmlFor={htmlFor} className={error ? "text-destructive" : ""}>
				{label} {required ? "*" : ""}
			</Label>
			{error ? (
				<span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
					<AlertCircle className="h-3.5 w-3.5 shrink-0" />
					{error}
				</span>
			) : null}
		</div>
	);
}

export function ClaimCreateForm(): JSX.Element {
	const router = useRouter();
	const { user, hasPermission } = useAuth();
	const mutation = useClaimsControllerCreate();

	const canManageOther = hasPermission(Permission.CLAIMS_MANAGE_OTHER);
	const canManageStatus = hasPermission(Permission.CLAIMS_MANAGE_STATUS);

	const defaultValues: CreateClaimFormValues = {
		customerId: user?.customerId ?? 0,
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
		validators: {
			onChange: createClaimSchema,
		},
		onSubmit: async ({ value }) => {
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

	const { data: orders = [], isLoading: ordersIsLoading } =
		useOrdersControllerFindAll({});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<Card>
				<CardHeader>
					<CardTitle>Claim Information</CardTitle>
					<CardDescription>
						Provide details regarding the customer complaint or issue ticket.
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-4 md:grid-cols-2">
					{canManageOther && (
						<form.Field name="customerId">
							{(field) => {
								const errorMsg = getErrorMessage(field.state.meta.errors[0]);
								return (
									<div className="space-y-2">
										<FieldHeader
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
												value={
													field.state.value > 0 ? field.state.value : undefined
												}
												onChange={(value) => field.handleChange(value)}
											/>
										</div>
									</div>
								);
							}}
						</form.Field>
					)}

					<form.Field name="type">
						{(field) => {
							const errorMsg = getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FieldHeader
										htmlFor="type"
										label="Claim Type"
										required
										error={errorMsg}
									/>
									<Select
										value={field.state.value}
										onValueChange={(val) =>
											field.handleChange(val as ClaimType)
										}
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
							const errorMsg = getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FieldHeader
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
								const errorMsg = getErrorMessage(field.state.meta.errors[0]);
								return (
									<div className="space-y-2">
										<FieldHeader
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

			<Card>
				<CardHeader>
					<CardTitle>Associations & Scope</CardTitle>
					<CardDescription>
						Optionally link this complaint to an existing order.
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-4 md:grid-cols-2">
					<form.Field name="orderId">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="orderId">Associated Order (Optional)</Label>
								<OrderSelect
									orders={orders}
									value={field.state.value}
									onChange={(value) => field.handleChange(value)}
									isLoading={ordersIsLoading}
								/>
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Issue Description & Resolution</CardTitle>
					<CardDescription>
						Describe the claim issue details thoroughly.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					<form.Field name="description">
						{(field) => {
							const errorMsg = getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FieldHeader
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
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="resolution">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="resolution">
									Initial Resolution Notes (Optional)
								</Label>
								<Textarea
									id="resolution"
									placeholder="Enter initial resolution text if resolved immediately..."
									rows={3}
									value={field.state.value ?? ""}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
							</div>
						)}
					</form.Field>
				</CardContent>
			</Card>

			<div className="flex justify-end gap-4">
				<Button type="button" variant="outline" onClick={() => router.back()}>
					Cancel
				</Button>

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							disabled={!canSubmit || mutation.isPending || isSubmitting}
						>
							{mutation.isPending || isSubmitting
								? "Creating Claim..."
								: "Create Claim"}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
