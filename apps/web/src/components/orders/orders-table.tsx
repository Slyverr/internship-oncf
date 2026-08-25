"use client";

import { OrderStatus } from "@ecommand/shared";
import type { ColumnDef } from "@tanstack/react-table";
import {
	createSortedRowModel,
	FlexRender,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
});

const columns: ColumnDef<typeof features, OrderListDto>[] = [
	{
		accessorKey: "orderNumber",
		header: "Order #",
		cell: (info) => (
			<span className="font-medium text-primary">
				{info.getValue<string | null>() ?? "—"}
			</span>
		),
		enableSorting: true,
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

	const search = globalFilter.trim().toLowerCase();
	const filteredData = data.filter((order) => {
		const matchesSearch =
			!search ||
			order.orderNumber?.toLowerCase().includes(search) ||
			order.customer.companyName.toLowerCase().includes(search) ||
			order.good.name.toLowerCase().includes(search) ||
			`${order.createdByUser.firstName} ${order.createdByUser.lastName}`
				.toLowerCase()
				.includes(search);

		const matchesStatus =
			statusFilter === "ALL" || order.orderStatus.name === statusFilter;

		return matchesSearch && matchesStatus;
	});

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
			<div className="flex flex-wrap items-center gap-4">
				<Input
					placeholder="Search orders..."
					value={globalFilter}
					onChange={(event) => setGlobalFilter(event.target.value)}
					className="w-full max-w-sm"
				/>

				<Select
					value={statusFilter}
					onValueChange={(value) => setStatusFilter(value ?? "ALL")}
				>
					<SelectTrigger className="w-full max-w-48">
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
								{headerGroup.headers.map((header) => {
									const canSort = header.column.getCanSort();
									const sortState = header.column.getIsSorted();

									return (
										<TableHead key={header.id}>
											{header.isPlaceholder ? null : (
												<button
													type="button"
													disabled={!canSort}
													onClick={header.column.getToggleSortingHandler()}
													className="flex w-full items-center gap-2 text-left"
												>
													<FlexRender header={header} />

													{sortState === "asc" && (
														<ChevronUpIcon className="size-4 text-foreground/70" />
													)}

													{sortState === "desc" && (
														<ChevronDownIcon className="size-4 text-foreground/70" />
													)}

													{!sortState && canSort && (
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
									role="link"
									tabIndex={0}
									className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									onClick={() =>
										router.push(`/dashboard/orders/${row.original.id}`)
									}
									onKeyDown={(event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											router.push(`/dashboard/orders/${row.original.id}`);
										}
									}}
								>
									{row.getAllCells().map((cell) => (
										<TableCell key={cell.id}>
											<FlexRender cell={cell} />
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="py-8 text-center"
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
