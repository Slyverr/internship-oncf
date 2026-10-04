"use client";

import { MapPinIcon, PackageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { getOrderStatusLabel } from "@/i18n/status-labels";
import type { OrderListDto } from "@/lib/api/generated.schemas";
import { useOrdersControllerFindAll } from "@/lib/api/orders";
import { useTrackingControllerTrackOrder } from "@/lib/api/tracking";
import { formatDisplayDate } from "@/lib/date-utils";

export function TrackingWorkspace({
	initialOrderNumber = "",
}: {
	initialOrderNumber?: string;
}) {
	const locale = useLocale();
	const t = useTranslate();
	const [orderSearch, setOrderSearch] = useState(initialOrderNumber);
	const [debouncedOrderSearch, setDebouncedOrderSearch] =
		useState(initialOrderNumber);
	const [selectedOrder, setSelectedOrder] = useState<OrderListDto | null>(null);
	const [submittedOrderNumber, setSubmittedOrderNumber] =
		useState(initialOrderNumber);
	const [selectedWagonId, setSelectedWagonId] = useState<number | null>(null);
	const [isOrderPickerOpen, setIsOrderPickerOpen] = useState(false);
	useEffect(() => {
		const timer = setTimeout(
			() => setDebouncedOrderSearch(orderSearch.trim()),
			250,
		);
		return () => clearTimeout(timer);
	}, [orderSearch]);
	const orderSearchQuery = useOrdersControllerFindAll(
		{
			search: debouncedOrderSearch || undefined,
			page: 1,
			limit: 20,
			hasAssignedWagons: true,
		},
		{ query: { enabled: isOrderPickerOpen, retry: false } },
	);
	const orderOptions = orderSearchQuery.data ?? [];
	const recentOrdersQuery = useOrdersControllerFindAll(
		{ page: 1, limit: 5, hasAssignedWagons: true },
		{
			query: {
				enabled: !submittedOrderNumber,
				retry: false,
				refetchInterval: 30_000,
			},
		},
	);
	const comboboxOrders =
		selectedOrder &&
		!orderOptions.some((order) => order.id === selectedOrder.id)
			? [selectedOrder, ...orderOptions]
			: orderOptions;
	const tracking = useTrackingControllerTrackOrder(submittedOrderNumber, {
		query: { enabled: Boolean(submittedOrderNumber), retry: false },
	});
	const wagons = tracking.data ?? [];
	const selectedWagon =
		wagons.find((entry) => entry.wagonId === selectedWagonId) ?? wagons[0];
	const latestReport = selectedWagon?.wagon?.wagonTrackings?.[0];
	const latitude = Number(latestReport?.latitude);
	const longitude = Number(latestReport?.longitude);
	const hasPosition =
		latestReport?.latitude !== null &&
		latestReport?.latitude !== undefined &&
		latestReport?.longitude !== null &&
		latestReport?.longitude !== undefined &&
		Number.isFinite(latitude) &&
		Number.isFinite(longitude);

	function selectOrder(order: OrderListDto | null) {
		setSelectedOrder(order);
		setOrderSearch(order?.orderNumber ?? "");
		setDebouncedOrderSearch(order?.orderNumber ?? "");
		setSubmittedOrderNumber(order?.orderNumber ?? "");
		setSelectedWagonId(null);
		const url = new URL(window.location.href);
		if (order) url.searchParams.set("order", order.orderNumber);
		else url.searchParams.delete("order");
		window.history.replaceState(window.history.state, "", url);
	}

	function updateOrderSearch(value: string) {
		setOrderSearch(value);
	}

	function changeOrderPickerOpen(open: boolean) {
		setIsOrderPickerOpen(open);
		if (open && selectedOrder) {
			setOrderSearch("");
			setDebouncedOrderSearch("");
		} else if (!open && submittedOrderNumber) {
			setOrderSearch(submittedOrderNumber);
			setDebouncedOrderSearch(submittedOrderNumber);
		}
	}

	function chooseRecentOrder(order: OrderListDto) {
		selectOrder(order);
	}

	const mapUrl = hasPosition
		? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.08}%2C${latitude - 0.05}%2C${longitude + 0.08}%2C${latitude + 0.05}&layer=mapnik&marker=${latitude}%2C${longitude}`
		: undefined;
	const externalMapUrl = hasPosition
		? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=12/${latitude}/${longitude}`
		: undefined;
	const recentOrdersCard =
		!submittedOrderNumber && recentOrdersQuery.data?.length ? (
			<Card>
				<CardHeader>
					<CardTitle>{t(Messages.tracking.quickAccess)}</CardTitle>
					<CardDescription>
						{t(Messages.tracking.refreshInterval)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid min-w-0 gap-2 @2xl/workspace:grid-cols-2 @5xl/workspace:grid-cols-3">
						{recentOrdersQuery.data.map((order) => (
							<button
								className="flex min-h-16 min-w-0 items-center justify-between gap-control rounded-lg border p-control text-left transition-colors hover:bg-muted/60"
								key={order.id}
								onClick={() => chooseRecentOrder(order)}
								type="button"
							>
								<span className="min-w-0">
									<span className="block truncate font-medium">
										{order.orderNumber}
									</span>
									<span className="block truncate text-xs text-muted-foreground">
										{order.customer.companyName} · {order.good.name} ·{" "}
										{formatDisplayDate(order.orderDate, locale)}
									</span>
								</span>
								<Badge className="shrink-0" variant="outline">
									{getOrderStatusLabel(order.orderStatus.name, locale)}
								</Badge>
							</button>
						))}
					</div>
				</CardContent>
			</Card>
		) : null;

	return (
		<div className="grid min-w-0 gap-6">
			{recentOrdersCard}
			<Card>
				<CardHeader>
					<CardTitle>{t(Messages.tracking.lookupTitle)}</CardTitle>
					<CardDescription>
						{t(Messages.tracking.lookupDescription)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="oncf-field min-w-0">
						<Label htmlFor="tracking-order-number">
							{t(Messages.tracking.orderNumber)}
						</Label>
						<Combobox
							items={comboboxOrders}
							value={selectedOrder}
							inputValue={orderSearch}
							filter={null}
							autoHighlight
							open={isOrderPickerOpen}
							itemToStringLabel={(order) => order.orderNumber}
							itemToStringValue={(order) => String(order.id)}
							onOpenChange={changeOrderPickerOpen}
							onInputValueChange={updateOrderSearch}
							onValueChange={selectOrder}
						>
							<ComboboxInput
								id="tracking-order-number"
								className="w-full"
								placeholder={t(Messages.tracking.orderSearchPlaceholder)}
								showClear
							/>
							<ComboboxContent>
								{orderOptions.length > 0 && (
									<div className="px-control pt-control text-xs text-muted-foreground">
										{debouncedOrderSearch
											? t(Messages.tracking.matchingOrders)
											: t(Messages.tracking.recentOrders)}
									</div>
								)}
								<ComboboxEmpty>
									{orderSearchQuery.isFetching
										? t(Messages.tracking.searchingOrders)
										: !debouncedOrderSearch
											? t(Messages.tracking.orderSearchHint)
											: t(Messages.tracking.noMatchingOrders)}
								</ComboboxEmpty>
								<ComboboxList>
									{(order) => (
										<ComboboxItem key={order.id} value={order}>
											<span className="flex min-w-0 flex-1 items-center justify-between gap-control pr-compact">
												<span className="min-w-0">
													<span className="block truncate font-medium">
														{order.orderNumber}
													</span>
													<span className="block truncate text-xs text-muted-foreground">
														{order.customer.companyName} · {order.good.name} ·{" "}
														{formatDisplayDate(order.orderDate, locale)}
													</span>
												</span>
												<Badge className="shrink-0" variant="outline">
													{getOrderStatusLabel(order.orderStatus.name, locale)}
												</Badge>
											</span>
										</ComboboxItem>
									)}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						{orderSearchQuery.isError && isOrderPickerOpen && (
							<InlineQueryRetry
								message={t(Messages.orders.select.loadFailed)}
								retryLabel={t(Messages.orders.select.retry)}
								isFetching={orderSearchQuery.isFetching}
								onRetry={() => void orderSearchQuery.refetch()}
							/>
						)}
					</div>
				</CardContent>
			</Card>

			{tracking.isFetching && (
				<div className="grid gap-4 @4xl/workspace:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]">
					<Skeleton className="min-h-80" />
					<Skeleton className="min-h-80" />
				</div>
			)}

			{tracking.isError && submittedOrderNumber && (
				<Card role="alert">
					<CardContent className="text-sm text-destructive">
						{t(Messages.tracking.loadError)}
					</CardContent>
				</Card>
			)}

			{tracking.isSuccess && (
				<div className="grid min-w-0 gap-4 @4xl/workspace:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
					<Card className="min-w-0">
						<CardHeader className="border-b">
							<div className="flex min-w-0 items-start justify-between gap-control">
								<div className="min-w-0">
									<CardTitle>{t(Messages.tracking.latestPosition)}</CardTitle>
									<CardDescription className="mt-1 break-all">
										{submittedOrderNumber}
									</CardDescription>
								</div>
								<Badge variant={hasPosition ? "secondary" : "outline"}>
									{hasPosition
										? latestReport?.status || t(Messages.tracking.statusUnknown)
										: t(Messages.tracking.positionPending)}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							{mapUrl ? (
								<div className="overflow-hidden rounded-lg border">
									<iframe
										className="aspect-[16/10] min-h-64 w-full bg-muted"
										title={t(Messages.tracking.mapTitle)}
										loading="lazy"
										src={mapUrl}
										referrerPolicy="no-referrer"
									/>
								</div>
							) : (
								<div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 p-6 text-center">
									<MapPinIcon
										className="size-8 text-muted-foreground"
										aria-hidden="true"
									/>
									<p className="max-w-md text-sm text-muted-foreground">
										{wagons.length
											? t(Messages.tracking.noPosition)
											: t(Messages.tracking.noWagons)}
									</p>
								</div>
							)}
							<div className="flex flex-wrap items-center justify-between gap-control text-sm">
								<span className="text-muted-foreground">
									{t(Messages.tracking.wagonCount, { count: wagons.length })}
								</span>
								{hasPosition && (
									<a
										className="font-medium text-primary underline-offset-4 hover:underline"
										href={externalMapUrl}
										target="_blank"
										rel="noreferrer"
									>
										{t(Messages.tracking.openMap)}
									</a>
								)}
							</div>
							<p className="text-xs leading-5 text-muted-foreground">
								{t(Messages.tracking.privacyNote)}
							</p>
						</CardContent>
					</Card>

					<Card className="min-w-0">
						<CardHeader className="border-b">
							<CardTitle className="flex items-center gap-2">
								<PackageIcon
									className="size-4 text-primary"
									aria-hidden="true"
								/>
								{t(Messages.tracking.wagons)}
							</CardTitle>
							<CardDescription>
								{t(Messages.tracking.selectWagon)}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{wagons.length ? (
								<div className="grid max-h-80 gap-2 overflow-y-auto overscroll-contain pr-1">
									{wagons.map((entry) => {
										const report = entry.wagon?.wagonTrackings?.[0];
										const selected = entry.wagonId === selectedWagon?.wagonId;
										return (
											<button
												aria-pressed={selected}
												className="flex min-h-16 w-full items-center justify-between gap-control rounded-lg border p-control text-left transition-colors hover:bg-muted/60 aria-pressed:border-primary aria-pressed:bg-primary/5"
												key={entry.wagonId}
												onClick={() => setSelectedWagonId(entry.wagonId)}
												type="button"
											>
												<span className="min-w-0">
													<span className="block font-medium">
														{entry.wagon?.wagonNumber ??
															`${t(Messages.tracking.wagon)} ${entry.wagonId}`}
													</span>
													<span className="block text-xs text-muted-foreground">
														{report?.status ||
															t(Messages.tracking.statusUnknown)}
													</span>
												</span>
												<Badge variant={report ? "secondary" : "outline"}>
													{report
														? t(Messages.tracking.lastReported)
														: t(Messages.tracking.positionPending)}
												</Badge>
											</button>
										);
									})}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">
									{t(Messages.tracking.noWagons)}
								</p>
							)}

							{selectedWagon && (
								<div className="grid gap-3 border-t pt-4 text-sm">
									<div className="flex items-start justify-between gap-4">
										<span className="text-muted-foreground">
											{t(Messages.tracking.wagon)}
										</span>
										<span className="font-medium text-right">
											{selectedWagon.wagon?.wagonNumber}
										</span>
									</div>
									<div className="flex items-start justify-between gap-4">
										<span className="text-muted-foreground">
											{t(Messages.tracking.status)}
										</span>
										<span className="font-medium text-right">
											{latestReport?.status ||
												t(Messages.tracking.statusUnknown)}
										</span>
									</div>
									{latestReport && (
										<div className="flex items-start justify-between gap-4">
											<span className="text-muted-foreground">
												{t(Messages.tracking.lastReported)}
											</span>
											<time
												className="text-right"
												dateTime={latestReport.recordedAt}
											>
												{new Date(latestReport.recordedAt).toLocaleString()}
											</time>
										</div>
									)}
									{hasPosition && (
										<div className="flex items-start justify-between gap-4">
											<span className="text-muted-foreground">
												{t(Messages.tracking.coordinates)}
											</span>
											<span className="text-right tabular-nums">
												{latitude.toFixed(4)}, {longitude.toFixed(4)}
											</span>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
