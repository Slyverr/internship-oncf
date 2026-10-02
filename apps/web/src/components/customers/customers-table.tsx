"use client";

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
	Table,
	TableBody,
	TableCell,
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

const features = tableFeatures({});

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
		},
		{
			accessorKey: "companyName",
			header: t(Messages.customers.list.company),
			cell: (info) => (
				<TableRowLink href={`/dashboard/customers/${info.row.original.id}`}>
					{info.getValue<string>()}
				</TableRowLink>
			),
		},
		{
			id: "customerType",
			accessorFn: (customer) =>
				getCustomerTypeLabel(customer.customerType?.name, t) ?? null,
			header: t(Messages.customers.list.type),
			cell: (info) => info.getValue<string | null>() ?? "—",
		},
		{
			accessorKey: "email",
			header: t(Messages.customers.list.email),
			cell: (info) => info.getValue<string | null>() ?? "—",
		},
		{
			accessorKey: "phone",
			header: t(Messages.customers.list.phone),
			cell: (info) => info.getValue<string | null>() ?? "—",
		},
		{
			accessorKey: "city",
			header: t(Messages.customers.list.city),
			cell: (info) => info.getValue<string | null>() ?? "—",
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
	const { searchValue, setSearchValue, updateSort } = useTableQueryState({
		search,
		sortBy,
		sortOrder,
	});

	const table = useTable({
		key: "customers-table",
		features,
		columns,
		data,
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
			</div>
		</div>
	);
}
