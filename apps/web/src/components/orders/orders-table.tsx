"use client";

import { OrderStatus } from "@ecommand/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { FlexRender, tableFeatures, useTable } from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { TableEmptyStateRow } from "@/components/common/table-empty-state-row";
import { TableLoadingState } from "@/components/common/table-loading-state";
import { TableRowLink } from "@/components/common/table-row-link";
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

interface OrdersTableProps {
	data: OrderListDto[];
	search?: string;
	status?: OrderStatus;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	isLoading?: boolean;
}

const features = tableFeatures({});

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
					{info.getValue<string | null>() ??
						t(Messages.orders.numberFallback, {
							id: info.row.original.id,
						})}
				</TableRowLink>
			),
		},
		{
			accessorFn: (row) => row.customer.companyName,
			id: "customer",
			header: t(Messages.orders.list.customer),
			cell: (info) => info.getValue<string>(),
		},
		{
			accessorFn: (row) => row.good.name,
			id: "good",
			header: t(Messages.orders.list.good),
			cell: (info) => info.getValue<string>(),
		},
		{
			accessorKey: "quantityDemanded",
			header: t(Messages.orders.list.quantity),
			cell: (info) => info.getValue<string>(),
		},
		{
			accessorFn: (row) => row.orderStatus.name,
			id: "status",
			header: t(Messages.orders.list.status),
			cell: (info) => getOrderStatusLabel(String(info.getValue()), locale),
		},
		{
			accessorKey: "orderDate",
			header: t(Messages.orders.list.date),
			cell: (info) => {
				const value = info.getValue<string | null>();

				return formatDisplayDate(value, locale);
			},
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
	const { searchValue, setSearchValue, updateQuery, updateSort } =
		useTableQueryState({ search, sortBy, sortOrder });

	const table = useTable({
		key: "orders-table",
		features,
		columns,
		data,
	});

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
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const sorted =
										sortBy === header.column.id ? sortOrder : undefined;

									return (
										<TableHead key={header.id}>
											{header.isPlaceholder ? null : (
												<button
													type="button"
													onClick={() => updateSort(header.column.id)}
													className="flex w-full items-center gap-2 text-left"
												>
													<FlexRender header={header} />

													{sorted === "asc" && (
														<ChevronUpIcon className="size-4" />
													)}

													{sorted === "desc" && (
														<ChevronDownIcon className="size-4" />
													)}

													{!sorted && (
														<ChevronsUpDownIcon className="size-4 text-muted-foreground/50" />
													)}
												</button>
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
			</div>
		</div>
	);
}
