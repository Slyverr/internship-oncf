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
import { OrderListDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";
import { formatEnumLabel } from "@/lib/enum-labels";

interface OrdersTableProps {
	data: OrderListDto[];
	search?: string;
	status?: OrderStatus;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	isLoading?: boolean;
}

const features = tableFeatures({});

const columns: ColumnDef<typeof features, OrderListDto>[] = [
	{
		accessorKey: "orderNumber",
		header: "Order #",
		cell: (info) => (
			<TableRowLink href={`/dashboard/orders/${info.row.original.id}`}>
				{info.getValue<string | null>() ?? `Order #${info.row.original.id}`}
			</TableRowLink>
		),
	},
	{
		accessorFn: (row) => row.customer.companyName,
		id: "customer",
		header: "Customer",
		cell: (info) => info.getValue<string>(),
	},
	{
		accessorFn: (row) => row.good.name,
		id: "good",
		header: "Good",
		cell: (info) => info.getValue<string>(),
	},
	{
		accessorKey: "quantityDemanded",
		header: "Qty",
		cell: (info) => info.getValue<string>(),
	},
	{
		accessorFn: (row) => row.orderStatus.name,
		id: "status",
		header: "Status",
		cell: (info) => formatEnumLabel(String(info.getValue())),
	},
	{
		accessorKey: "orderDate",
		header: "Order Date",
		cell: (info) => {
			const value = info.getValue<string | null>();

			return formatDisplayDate(value);
		},
	},
];

export function OrdersTable({
	data,
	search = "",
	status,
	sortBy,
	sortOrder,
	isLoading,
}: OrdersTableProps) {
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
					placeholder="Search orders..."
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
							{status ? formatEnumLabel(status) : "All statuses"}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">All statuses</SelectItem>

						{Object.values(OrderStatus).map((value) => (
							<SelectItem key={value} value={value}>
								{formatEnumLabel(value)}
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
										router.push(`/dashboard/orders/${row.original.id}`)
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
								message="No orders found."
							/>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
