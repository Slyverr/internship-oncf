"use client";

import { OrderStatus, Permission } from "@ecommand/shared";
import { useForm } from "@tanstack/react-form-nextjs";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { JSX } from "react";
import { z } from "zod";

import { CustomerSelect } from "@/components/customers/customer-select";
import { GoodSelect } from "@/components/goods/good-select";
import { Button } from "@/components/ui/button";
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
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerCreate } from "@/lib/api/orders";
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

type CreateOrderFormValues = z.infer<typeof createOrderSchema>;

function getErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	if (typeof error === "string") return error;
	if (typeof error === "object" && "message" in error) {
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

export function OrderCreateForm(): JSX.Element {
	const router = useRouter();
	const { profile, hasPermission } = useAuth();
	const mutation = useOrdersControllerCreate();

	const canManageOther = hasPermission(Permission.ORDERS_MANAGE_OTHER);
	const canManageStatus = hasPermission(Permission.ORDERS_MANAGE_STATUS);

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
		validators: {
			onChange: createOrderSchema,
		},
		onSubmit: async ({ value }) => {
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
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<Card>
				<CardHeader>
					<CardTitle>Order Information</CardTitle>
					<CardDescription>
						Specify the client, commodity details, and requested execution
						volume.
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

					<form.Field name="goodsId">
						{(field) => {
							const errorMsg = getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FieldHeader
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
												field.state.value > 0 ? field.state.value : undefined
											}
											onChange={(value) => field.handleChange(value)}
										/>
									</div>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="unitId">
						{(field) => {
							const errorMsg = getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FieldHeader
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
											onChange={(value) => field.handleChange(value)}
										/>
									</div>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="quantityDemanded">
						{(field) => {
							const errorMsg = getErrorMessage(field.state.meta.errors[0]);
							return (
								<div className="space-y-2">
									<FieldHeader
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
										onChange={(event) => field.handleChange(event.target.value)}
									/>
								</div>
							);
						}}
					</form.Field>

					<form.Field name="supervisor">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="supervisor">Supervisor Name</Label>
								<Input
									id="supervisor"
									placeholder="Name of supervisor"
									value={field.state.value ?? ""}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
							</div>
						)}
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Schedule & Timelines</CardTitle>
					<CardDescription>
						Operational milestones: set the formal order logging date along with
						planned start and end targets.
					</CardDescription>
				</CardHeader>

				<CardContent className="grid gap-4 md:grid-cols-3">
					<form.Field name="orderDate">
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor="orderDate">Order Date</Label>
								<Input
									id="orderDate"
									type="date"
									value={field.state.value ?? ""}
									onChange={(event) => field.handleChange(event.target.value)}
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
									onChange={(event) => field.handleChange(event.target.value)}
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
									onChange={(event) => field.handleChange(event.target.value)}
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
								<Label htmlFor="remarks">Remarks & Operational Notes</Label>
								<Textarea
									id="remarks"
									placeholder="Enter any additional instructions or remarks..."
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
								? "Creating Order..."
								: "Create Order"}
						</Button>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
