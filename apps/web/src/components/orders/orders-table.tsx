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
import { useEffect, useState } from "react";
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
import { useDebounce } from "@/hooks/use-debounce";
import { OrderListDto } from "@/lib/api/generated.schemas";

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
			<span className="font-medium text-primary">
				{info.getValue<string | null>() ?? "—"}
			</span>
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
			const value = info.getValue<string | null>();

			return value ? new Date(value).toLocaleDateString() : "—";
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

	const [searchValue, setSearchValue] = useState(search);
	const debouncedSearch = useDebounce(searchValue, 400);

	useEffect(() => {
		setSearchValue(search);
	}, [search]);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);

		if (!debouncedSearch) {
			params.delete("search");
		} else {
			params.set("search", debouncedSearch);
		}

		router.push(`?${params.toString()}`);
	}, [debouncedSearch, router]);

	const updateQuery = (key: string, value?: string) => {
		const params = new URLSearchParams(window.location.search);

		if (!value || value === "ALL") {
			params.delete(key);
		} else {
			params.set(key, value);
		}

		router.push(`?${params.toString()}`);
	};

	const updateSort = (column: string) => {
		const params = new URLSearchParams(window.location.search);

		const nextOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";

		params.set("sortBy", column);
		params.set("sortOrder", nextOrder);

		router.push(`?${params.toString()}`);
	};

	const table = useTable({
		key: "orders-table",
		features,
		columns,
		data,
	});

	if (isLoading) {
		return <div>Loading orders…</div>;
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
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">All statuses</SelectItem>

						{Object.values(OrderStatus).map((value) => (
							<SelectItem key={value} value={value}>
								{value}
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
