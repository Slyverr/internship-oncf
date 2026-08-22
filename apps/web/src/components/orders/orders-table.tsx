"use client";

import { OrderStatus } from "@ecommand/shared";
import type { ColumnDef } from "@tanstack/react-table";
import {
	createSortedRowModel,
	FlexRender,
	rowSortingFeature,
	sortFns,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import { OrderListDto } from "@/lib/api/generated.schemas";

interface OrdersTableProps {
	data: OrderListDto[];
	isLoading?: boolean;
}

const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns,
});

const columns: ColumnDef<typeof features, OrderListDto>[] = [
	{
		accessorFn: (d) => d.orderNumber,
		header: "Order #",
		cell: (info) => (
			<span className="font-medium text-primary">
				{String(info.getValue())}
			</span>
		),
		enableSorting: true,
	},
	{
		accessorFn: (d) => d.customer.companyName,
		header: "Customer",
		cell: (info) => `${info.getValue<number>()}`,
	},
	{
		accessorFn: (d) => d.good.name,
		header: "Goods",
		cell: (info) => `${info.getValue()}`,
	},
	{
		accessorKey: "quantityDemanded",
		header: "Qty",
	},
	{
		accessorFn: (d) => d.orderStatus.name,
		header: "Status",
		cell: (info) => (
			<span className="capitalize">
				{String(info.getValue()).toLowerCase()}
			</span>
		),
	},
	{
		accessorKey: "orderDate",
		header: "Order Date",
		cell: (info) => {
			const value = info.getValue<string | null | undefined>();

			return value ? new Date(value).toLocaleDateString() : "—";
		},
		enableSorting: true,
	},
];

export function OrdersTable({ data, isLoading }: OrdersTableProps) {
	const router = useRouter();

	const [globalFilter, setGlobalFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");

	const filteredData = useMemo(() => {
		const search = globalFilter.trim().toLowerCase();

		return data.filter((order) => {
			const matchesSearch =
				!search ||
				order.orderNumber?.toLowerCase().includes(search) ||
				String(order.customer.id).includes(search);

			const matchesStatus =
				statusFilter === "ALL" || order.orderStatus.name === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [data, globalFilter, statusFilter]);

	const table = useTable({
		key: "orders-table",
		features,
		columns,
		data: filteredData,
		initialState: {
			sorting: [{ id: "orderDate", desc: true }],
		},
	});

	if (isLoading) {
		return <div>Loading orders…</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-3">
				<Input
					placeholder="Search by order # or customer…"
					value={globalFilter}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="max-w-sm"
				/>

				<Select
					value={statusFilter}
					onValueChange={(value) => setStatusFilter(value ?? "ALL")}
				>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">All statuses</SelectItem>

						{Object.values(OrderStatus).map((status) => (
							<SelectItem key={status} value={status}>
								{status}
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
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : (
											<button
												type="button"
												disabled={!header.column.getCanSort()}
												className={
													header.column.getCanSort()
														? "group flex w-full cursor-pointer items-center gap-1 text-left"
														: "flex w-full items-center gap-1 text-left"
												}
												onClick={header.column.getToggleSortingHandler()}
											>
												<FlexRender header={header} />

												{header.column.getIsSorted() === "asc" && (
													<ChevronUpIcon className="size-4 text-foreground/70" />
												)}

												{header.column.getIsSorted() === "desc" && (
													<ChevronDownIcon className="size-4 text-foreground/70" />
												)}

												{!header.column.getIsSorted() &&
													header.column.getCanSort() && (
														<ChevronsUpDownIcon className="size-4 text-muted-foreground/50 transition-opacity group-hover:text-muted-foreground" />
													)}
											</button>
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									role="button"
									tabIndex={0}
									className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									onClick={() =>
										router.push(`/dashboard/orders/${row.original.id}`)
									}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											router.push(`/dashboard/orders/${row.original.id}/edit`);
										}
									}}
								>
									{row.getAllCells().map((cell) => (
										<TableCell key={cell.id}>
											<table.FlexRender cell={cell} />
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No orders found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
