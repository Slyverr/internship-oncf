"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FlexRender, useTable } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { sortableTableFeatures as features } from "@/components/common/sortable-table-features";
import { TableEmptyStateRow } from "@/components/common/table-empty-state-row";
import { TableLoadingState } from "@/components/common/table-loading-state";
import { TableRowLink } from "@/components/common/table-row-link";
import { TableSortButton } from "@/components/common/table-sort-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { useTranslate } from "@/i18n/locale-provider";
import type { CustomerListDto } from "@/lib/api/generated.schemas";
import { getCustomerTypeLabel } from "@/lib/customer-type-label";

interface CustomersTableProps {
	data: CustomerListDto[];
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	isLoading?: boolean;
}

function createColumns(
	t: ReturnType<typeof useTranslate>,
): ColumnDef<typeof features, CustomerListDto>[] {
	return [
		{
			accessorKey: "customerCode",
			header: t(Messages.customers.list.code),
			cell: (info) => (
				<span className="font-medium text-primary">
					{info.getValue<string | null>() ?? "—"}
				</span>
			),
			enableSorting: true,
		},
		{
			accessorKey: "companyName",
			header: t(Messages.customers.list.company),
			cell: (info) => (
				<TableRowLink href={`/dashboard/customers/${info.row.original.id}`}>
					{info.getValue<string>()}
				</TableRowLink>
			),
			enableSorting: true,
		},
		{
			id: "customerType",
			accessorFn: (customer) =>
				getCustomerTypeLabel(customer.customerType?.name, t) ?? null,
			header: t(Messages.customers.list.type),
			cell: (info) => {
				const value = info.getValue<string | null>();
				return value ? <Badge variant="outline">{value}</Badge> : "—";
			},
			enableSorting: true,
		},
		{
			accessorKey: "email",
			header: t(Messages.customers.list.email),
			cell: (info) => info.getValue<string | null>() ?? "—",
			enableSorting: true,
		},
		{
			accessorKey: "phone",
			header: t(Messages.customers.list.phone),
			cell: (info) => info.getValue<string | null>() ?? "—",
			enableSorting: true,
		},
		{
			accessorKey: "city",
			header: t(Messages.customers.list.city),
			cell: (info) => info.getValue<string | null>() ?? "—",
			enableSorting: true,
		},
	];
}

export function CustomersTable({
	data,
	search = "",
	sortBy,
	sortOrder,
	isLoading,
}: CustomersTableProps) {
	const t = useTranslate();
	const columns = useMemo(() => createColumns(t), [t]);
	const router = useRouter();
	const { searchValue, setSearchValue, updateSort, sorting } =
		useTableQueryState({
			search,
			sortBy,
			sortOrder,
			defaultSortBy: "customerCode",
			defaultSortOrder: "asc",
		});

	const table = useTable({
		key: "customers-table",
		features,
		columns,
		data,
		state: { sorting },
	});

	if (isLoading) {
		return <TableLoadingState resource="customers" />;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-4">
				<Input
					placeholder={t(Messages.customers.list.search)}
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					className="w-full max-w-sm"
				/>
			</div>

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
										router.push(`/dashboard/customers/${row.original.id}`)
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
								message={t(Messages.customers.list.noResults)}
							/>
						)}
					</TableBody>
				</Table>
			</TableFrame>
		</div>
	);
}
