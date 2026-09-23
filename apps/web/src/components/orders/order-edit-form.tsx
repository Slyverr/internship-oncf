"use client";

import { OrderStatus, Permission } from "@ecommand/shared";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { GoodSelect } from "@/components/goods/good-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { UnitSelect } from "@/components/units/unit-select";
import type {
	OrderDetailDto,
	UpdateOrderDto,
} from "@/lib/api/generated.schemas";
import {
	getOrdersControllerFindOneQueryKey,
	useOrdersControllerUpdate,
} from "@/lib/api/orders";
import { useAuth } from "@/providers/auth-provider";

const ORDER_QUANTITY_PATTERN = /^\d+(\.\d{1,3})?$/;

export function OrderEditForm({ order }: { order: OrderDetailDto }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { hasPermission } = useAuth();
	const mutation = useOrdersControllerUpdate();

	const [error, setError] = useState("");
	const [values, setValues] = useState({
		goodsId: order.goodsId,
		unitId: order.unitId,
		quantityDemanded: order.quantityDemanded,
		supervisor: order.supervisor ?? "",
		remarks: order.remarks ?? "",
		orderDate: order.orderDate.slice(0, 10),
		startDate: order.startDate?.slice(0, 10) ?? "",
		endDate: order.endDate?.slice(0, 10) ?? "",
	});
	const [savedValues, setSavedValues] = useState(values);

	const hasChanges =
		values.goodsId !== savedValues.goodsId ||
		values.unitId !== savedValues.unitId ||
		values.quantityDemanded.trim() !== savedValues.quantityDemanded.trim() ||
		values.supervisor.trim() !== savedValues.supervisor.trim() ||
		values.remarks.trim() !== savedValues.remarks.trim() ||
		values.orderDate !== savedValues.orderDate ||
		values.startDate !== savedValues.startDate ||
		values.endDate !== savedValues.endDate;

	function change<K extends keyof typeof values>(
		key: K,
		value: (typeof values)[K],
	) {
		setValues((previous) => ({ ...previous, [key]: value }));
		setError("");
	}

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (mutation.isPending || !hasChanges) return;

		setError("");

		const quantity = values.quantityDemanded.trim();

		if (
			!values.goodsId ||
			!values.unitId ||
			!ORDER_QUANTITY_PATTERN.test(quantity) ||
			Number(quantity) <= 0
		) {
			setError(
				"Select goods and a unit, and enter a positive quantity with at most three decimal places.",
			);
			return;
		}

		if (
			!values.orderDate ||
			(savedValues.startDate && !values.startDate) ||
			(savedValues.endDate && !values.endDate)
		) {
			setError("The order date and any previously saved dates are required.");
			return;
		}

		if (
			values.startDate &&
			values.endDate &&
			values.startDate > values.endDate
		) {
			setError("The completion date must be on or after the start date.");
			return;
		}

		const data: UpdateOrderDto = {
			goodsId: values.goodsId,
			unitId: values.unitId,
			quantityDemanded: quantity,
			supervisor: values.supervisor.trim(),
			remarks: values.remarks.trim(),
		};

		// Preserve original timestamps unless their calendar dates change.
		if (values.orderDate !== savedValues.orderDate) {
			data.orderDate = values.orderDate;
		}

		if (values.startDate && values.startDate !== savedValues.startDate) {
			data.startDate = values.startDate;
		}

		if (values.endDate && values.endDate !== savedValues.endDate) {
			data.endDate = values.endDate;
		}

		try {
			const updated = await mutation.mutateAsync({ id: order.id, data });

			setSavedValues(values);

			queryClient.setQueryData(
				getOrdersControllerFindOneQueryKey(order.id),
				updated,
			);
			void queryClient.invalidateQueries({ queryKey: ["/orders"] });

			toast.add({
				type: "success",
				title: "Order saved",
				description: "Your changes have been saved successfully.",
			});

			router.refresh();
		} catch (cause) {
			const message: unknown = isAxiosError(cause)
				? cause.response?.data?.message
				: undefined;

			toast.add({
				type: "error",
				title: "Could not save order",
				description:
					typeof message === "string"
						? message
						: Array.isArray(message)
							? message.join(". ")
							: "Please try again.",
			});
		}
	}

	if (
		!hasPermission(Permission.ORDERS_UPDATE) ||
		order.orderStatus.name !== OrderStatus.DRAFT
	) {
		return (
			<p role="alert">
				Only draft orders you have permission to update can be edited.
			</p>
		);
	}

	return (
		<form onSubmit={submit} className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Edit {order.orderNumber}</CardTitle>
					<p>{order.customer.companyName}</p>
				</CardHeader>

				<CardContent>
					<fieldset
						disabled={mutation.isPending}
						className="grid gap-4 md:grid-cols-2"
					>
						<div className="space-y-2">
							<Label>Goods / Commodity</Label>
							<GoodSelect
								value={values.goodsId}
								onChange={(value) => change("goodsId", value)}
							/>
						</div>

						<div className="space-y-2">
							<Label>Unit of Measurement</Label>
							<UnitSelect
								value={values.unitId}
								onChange={(value) => change("unitId", value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="quantityDemanded">Quantity Demanded *</Label>
							<Input
								id="quantityDemanded"
								inputMode="decimal"
								required
								value={values.quantityDemanded}
								onChange={(event) =>
									change("quantityDemanded", event.target.value)
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="supervisor">Supervisor</Label>
							<Input
								id="supervisor"
								maxLength={200}
								value={values.supervisor}
								onChange={(event) => change("supervisor", event.target.value)}
							/>
						</div>

						{(
							[
								["orderDate", "Order Date"],
								["startDate", "Planned Transport Start"],
								["endDate", "Planned Completion Target"],
							] as const
						).map(([key, label]) => (
							<div key={key} className="space-y-2">
								<Label htmlFor={key}>{label}</Label>
								<Input
									id={key}
									type="date"
									required={
										key === "orderDate" ||
										(key === "startDate" && Boolean(savedValues.startDate)) ||
										(key === "endDate" && Boolean(savedValues.endDate))
									}
									min={key === "endDate" ? values.startDate : undefined}
									value={values[key]}
									onChange={(event) => change(key, event.target.value)}
								/>
							</div>
						))}

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="remarks">Remarks</Label>
							<Textarea
								id="remarks"
								value={values.remarks}
								onChange={(event) => change("remarks", event.target.value)}
							/>
						</div>
					</fieldset>
				</CardContent>
			</Card>

			{error && (
				<p role="alert" className="text-destructive">
					{error}
				</p>
			)}

			<div className="flex justify-end gap-4">
				<Button
					type="button"
					variant="outline"
					disabled={mutation.isPending}
					onClick={() => router.push(`/dashboard/orders/${order.id}`)}
				>
					Back to Order
				</Button>

				<Button type="submit" disabled={mutation.isPending || !hasChanges}>
					{mutation.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</form>
	);
}
