"use client";

import { ProgramStatus } from "@ecommand/shared";
import type { ColumnDef } from "@tanstack/react-table";
import {
	createSortedRowModel,
	FlexRender,
	rowSortingFeature,
	sortFn_datetime,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
	PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TableEmptyStateRow } from "@/components/common/table-empty-state-row";
import { TableLoadingState } from "@/components/common/table-loading-state";
import { TableRowLink } from "@/components/common/table-row-link";
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
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ProgramListDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";
import { formatEnumLabel } from "@/lib/enum-labels";

interface ProgramsTableProps {
	data: ProgramListDto[];
	isLoading?: boolean;
}

const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: { datetime: sortFn_datetime },
});

const columns: ColumnDef<typeof features, ProgramListDto>[] = [
	{
		accessorKey: "programNumber",
		header: "Program #",
		cell: (info) => (
			<TableRowLink
				href={`/dashboard/programs/${info.row.original.programNumber}`}
			>
				{info.getValue<string>()}
			</TableRowLink>
		),
		enableSorting: true,
	},
	{
		accessorFn: (row) => row.order.orderNumber,
		id: "orderNumber",
		header: "Order #",
		cell: (info) => info.getValue<string | null>() ?? "—",
		enableSorting: true,
	},
	{
		accessorKey: "quantityPlanned",
		header: "Qty Planned",
		cell: (info) => info.getValue<string>(),
	},
	{
		accessorKey: "quantityRealized",
		header: "Qty Realized",
		cell: (info) => info.getValue<string | null>() ?? "—",
	},
	{
		accessorFn: (row) => row.programStatus.name,
		id: "status",
		header: "Status",
		cell: (info) => formatEnumLabel(String(info.getValue())),
	},
	{
		accessorKey: "plannedDate",
		header: "Planned Date",
		cell: (info) => {
			const value = info.getValue<string>();
			return formatDisplayDate(value);
		},
		sortFn: "datetime",
		enableSorting: true,
	},
	{
		accessorFn: (row) =>
			`${row.createdByUser.firstName} ${row.createdByUser.lastName}`,
		id: "createdByUser",
		header: "Created By",
		cell: (info) => info.getValue<string>(),
	},
];

export function ProgramsTable({ data, isLoading }: ProgramsTableProps) {
	const router = useRouter();
	const [globalFilter, setGlobalFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");

	const search = globalFilter.trim().toLowerCase();
	const filteredData = data.filter((program) => {
		const matchesSearch =
			!search ||
			program.programNumber.toLowerCase().includes(search) ||
			program.order.orderNumber?.toLowerCase().includes(search) ||
			`${program.createdByUser.firstName} ${program.createdByUser.lastName}`
				.toLowerCase()
				.includes(search);

		const matchesStatus =
			statusFilter === "ALL" || program.programStatus.name === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const table = useTable({
		key: "programs-table",
		features,
		columns,
		data: filteredData,
		initialState: {
			sorting: [{ id: "plannedDate", desc: true }],
		},
	});

	if (isLoading) {
		return <TableLoadingState resource="programs" />;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-4">
				<Input
					placeholder="Search programs..."
					value={globalFilter}
					onChange={(event) => setGlobalFilter(event.target.value)}
					className="w-full max-w-sm"
				/>

				<Select
					value={statusFilter}
					onValueChange={(value) => setStatusFilter(value ?? "ALL")}
				>
					<SelectTrigger className="w-full max-w-48">
						<SelectValue>
							{statusFilter === "ALL"
								? "All statuses"
								: formatEnumLabel(statusFilter)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">All statuses</SelectItem>

						{Object.values(ProgramStatus).map((status) => (
							<SelectItem key={status} value={status}>
								{formatEnumLabel(status)}
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
									className="cursor-pointer"
									onClick={() =>
										router.push(
											`/dashboard/programs/${row.original.programNumber}`,
										)
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
								message={
									search || statusFilter !== "ALL"
										? "No programs match your search or filters."
										: "No programs yet."
								}
								description={
									search || statusFilter !== "ALL"
										? search && statusFilter !== "ALL"
											? "Try another search or clear the selected status."
											: search
												? "Try a different search term."
												: "Choose a different status."
										: "Start from an order that is eligible for planning."
								}
								action={
									search || statusFilter !== "ALL" ? (
										<Button
											variant="outline"
											onClick={() => {
												setGlobalFilter("");
												setStatusFilter("ALL");
											}}
										>
											Clear filters
										</Button>
									) : (
										<Link
											href="/dashboard/programs/new"
											className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										>
											<PlusIcon aria-hidden="true" className="size-4" />
											Choose an eligible order
										</Link>
									)
								}
							/>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
