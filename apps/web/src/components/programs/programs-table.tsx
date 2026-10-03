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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionLink } from "@/components/common/action-link";
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
	TableFrame,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { type AppLocale, Messages, type TypedMessageTranslator } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { getProgramStatusLabel } from "@/i18n/status-labels";
import { ProgramListDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";

interface ProgramsTableProps {
	data: ProgramListDto[];
	isLoading?: boolean;
}

const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: { datetime: sortFn_datetime },
});

function getProgramColumns(
	t: TypedMessageTranslator,
	locale: AppLocale,
): ColumnDef<typeof features, ProgramListDto>[] {
	return [
		{
			accessorKey: "programNumber",
			header: t(Messages.programs.list.programNumber),
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
			header: t(Messages.programs.list.orderNumber),
			cell: (info) => info.getValue<string | null>() ?? "—",
			enableSorting: true,
		},
		{
			accessorKey: "quantityPlanned",
			header: t(Messages.programs.list.quantityPlanned),
			cell: (info) => info.getValue<string>(),
		},
		{
			accessorKey: "quantityRealized",
			header: t(Messages.programs.list.quantityRealized),
			cell: (info) => info.getValue<string | null>() ?? "—",
		},
		{
			accessorFn: (row) => row.programStatus.name,
			id: "status",
			header: t(Messages.programs.list.status),
			cell: (info) => getProgramStatusLabel(String(info.getValue()), locale),
		},
		{
			accessorKey: "plannedDate",
			header: t(Messages.programs.list.plannedDate),
			cell: (info) => {
				const value = info.getValue<string>();
				return formatDisplayDate(value, locale);
			},
			sortFn: "datetime",
			enableSorting: true,
		},
		{
			accessorFn: (row) =>
				`${row.createdByUser.firstName} ${row.createdByUser.lastName}`,
			id: "createdByUser",
			header: t(Messages.programs.list.createdBy),
			cell: (info) => info.getValue<string>(),
		},
	];
}

export function ProgramsTable({ data, isLoading }: ProgramsTableProps) {
	const t = useTranslate();
	const locale = useLocale();
	const router = useRouter();
	const [globalFilter, setGlobalFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const columns = getProgramColumns(t, locale);

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
					placeholder={t(Messages.programs.list.search)}
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
								? t(Messages.programs.list.allStatuses)
								: getProgramStatusLabel(statusFilter, locale)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">
							{t(Messages.programs.list.allStatuses)}
						</SelectItem>

						{Object.values(ProgramStatus).map((status) => (
							<SelectItem key={status} value={status}>
								{getProgramStatusLabel(status, locale)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<TableFrame>
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
										? t(Messages.programs.list.noMatches)
										: t(Messages.programs.list.empty)
								}
								description={
									search || statusFilter !== "ALL"
										? search && statusFilter !== "ALL"
											? t(Messages.programs.list.tryBoth)
											: search
												? t(Messages.programs.list.trySearch)
												: t(Messages.programs.list.tryStatus)
										: t(Messages.programs.list.emptyDescription)
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
											{t(Messages.programs.list.clearFilters)}
										</Button>
									) : (
										<ActionLink href="/dashboard/programs/new">
											<PlusIcon aria-hidden="true" className="size-4" />
											{t(Messages.programs.list.chooseOrder)}
										</ActionLink>
									)
								}
							/>
						)}
					</TableBody>
				</Table>
			</TableFrame>
		</div>
	);
}
