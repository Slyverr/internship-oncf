"use client";

import { OrderStatus } from "@ecommand/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { FlexRender, useTable } from "@tanstack/react-table";
import { DownloadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { sortableTableFeatures as features } from "@/components/common/sortable-table-features";
import { TableEmptyStateRow } from "@/components/common/table-empty-state-row";
import { TableLoadingState } from "@/components/common/table-loading-state";
import { TableRowLink } from "@/components/common/table-row-link";
import { TableSortButton } from "@/components/common/table-sort-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableFrame,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTableQueryState } from "@/hooks/use-table-query-state";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { getOrderStatusLabel } from "@/i18n/status-labels";
import { OrderListDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";
import {
	fetchAllOrdersForExport,
	getOrderExportFilters,
	ordersToCsv,
} from "@/lib/orders-export";

interface OrdersTableProps {
	data: OrderListDto[];
	search?: string;
	status?: OrderStatus;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	isLoading?: boolean;
}

function createColumns(
	t: ReturnType<typeof useTranslate>,
	locale: ReturnType<typeof useLocale>,
): ColumnDef<typeof features, OrderListDto>[] {
	return [
		{
			accessorKey: "orderNumber",
			header: t(Messages.orders.list.orderNumber),
			cell: (info) => (
				<TableRowLink
					href={`/dashboard/orders/${info.row.original.orderNumber}`}
				>
					{info.getValue<string>()}
				</TableRowLink>
			),
			enableSorting: true,
		},
		{
			accessorFn: (row) => row.customer.companyName,
			id: "customer",
			header: t(Messages.orders.list.customer),
			cell: (info) => info.getValue<string>(),
			enableSorting: true,
		},
		{
			accessorFn: (row) => row.good.name,
			id: "good",
			header: t(Messages.orders.list.good),
			cell: (info) => info.getValue<string>(),
			enableSorting: true,
		},
		{
			accessorKey: "quantityDemanded",
			header: t(Messages.orders.list.quantity),
			cell: (info) => info.getValue<string>(),
			enableSorting: true,
		},
		{
			accessorFn: (row) => row.orderStatus.name,
			id: "status",
			header: t(Messages.orders.list.status),
			cell: (info) => (
				<Badge variant="outline">
					{getOrderStatusLabel(String(info.getValue()), locale)}
				</Badge>
			),
			enableSorting: true,
		},
		{
			accessorKey: "orderDate",
			header: t(Messages.orders.list.date),
			cell: (info) => {
				const value = info.getValue<string | null>();

				return formatDisplayDate(value, locale);
			},
			sortFn: "datetime",
			enableSorting: true,
		},
	];
}

export function OrdersTable({
	data,
	search = "",
	status,
	sortBy,
	sortOrder,
	isLoading,
}: OrdersTableProps) {
	const t = useTranslate();
	const locale = useLocale();
	const columns = useMemo(() => createColumns(t, locale), [locale, t]);
	const router = useRouter();
	const [isExporting, setIsExporting] = useState(false);
	const [exportError, setExportError] = useState("");
	const { searchValue, setSearchValue, updateQuery, updateSort, sorting } =
		useTableQueryState({
			search,
			sortBy,
			sortOrder,
			defaultSortBy: "orderDate",
			defaultSortOrder: "desc",
		});

	const table = useTable({
		key: "orders-table",
		features,
		columns,
		data,
		state: { sorting },
	});

	const exportOrders = async () => {
		setIsExporting(true);
		setExportError("");
		try {
			const filters = getOrderExportFilters(
				searchValue,
				window.location.search,
			);
			const orders = await fetchAllOrdersForExport(filters);
			const csv = ordersToCsv(
				orders,
				{
					orderNumber: t(Messages.orders.list.orderNumber),
					customer: t(Messages.orders.list.customer),
					good: t(Messages.orders.list.good),
					quantityDemanded: t(Messages.orders.createForm.quantity),
					quantityAchieved: t(Messages.common.fields.quantityAchieved),
					unit: t(Messages.common.fields.unitId),
					status: t(Messages.orders.list.status),
					orderDate: t(Messages.orders.list.date),
					startDate: t(Messages.common.fields.startDate),
					endDate: t(Messages.common.fields.endDate),
					createdBy: t(Messages.orders.list.createdBy),
				},
				(statusValue) => getOrderStatusLabel(statusValue, locale),
				(dateValue) => formatDisplayDate(dateValue, locale),
			);
			const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
			document.body.append(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		} catch {
			setExportError(t(Messages.orders.list.exportFailed));
		} finally {
			setIsExporting(false);
		}
	};

	if (isLoading) {
		return <TableLoadingState resource="orders" />;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-4">
				<Input
					placeholder={t(Messages.orders.list.search)}
					value={searchValue}
					onChange={(event) => setSearchValue(event.target.value)}
					className="w-full max-w-sm"
				/>

				<Select
					value={status ?? "ALL"}
					onValueChange={(value) => value && updateQuery("status", value)}
				>
					<SelectTrigger className="w-full max-w-48">
						<SelectValue>
							{status
								? getOrderStatusLabel(status, locale)
								: t(Messages.orders.list.allStatuses)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">
							{t(Messages.orders.list.allStatuses)}
						</SelectItem>

						{Object.values(OrderStatus).map((value) => (
							<SelectItem key={value} value={value}>
								{getOrderStatusLabel(value, locale)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button
					className="ml-auto"
					variant="outline"
					disabled={isExporting}
					onClick={exportOrders}
				>
					<DownloadIcon aria-hidden="true" />
					{t(
						isExporting
							? Messages.orders.list.exporting
							: Messages.orders.list.exportExcel,
					)}
				</Button>
			</div>
			{exportError && (
				<p role="alert" className="text-sm text-destructive">
					{exportError}
				</p>
			)}

			<TableFrame>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const sorted = header.column.getIsSorted();

									return (
										<TableHead
											key={header.id}
											aria-sort={
												sorted === "asc"
													? "ascending"
													: sorted === "desc"
														? "descending"
														: "none"
											}
										>
											{header.isPlaceholder ? null : (
												<TableSortButton
													sorted={sorted}
													canSort={header.column.getCanSort()}
													onClick={() => {
														updateSort(header.column.id);
													}}
												>
													<FlexRender header={header} />
												</TableSortButton>
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									className="cursor-pointer"
									onClick={() =>
										router.push(`/dashboard/orders/${row.original.orderNumber}`)
									}
								>
									{row.getAllCells().map((cell) => (
										<TableCell key={cell.id}>
											<FlexRender cell={cell} />
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableEmptyStateRow
								colSpan={columns.length}
								message={t(Messages.orders.list.noResults)}
							/>
						)}
					</TableBody>
				</Table>
			</TableFrame>
		</div>
	);
}
