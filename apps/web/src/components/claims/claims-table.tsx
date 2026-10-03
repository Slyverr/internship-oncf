"use client";

import { ClaimPriority, ClaimStatus, ClaimType } from "@ecommand/shared";
import type { ColumnDef } from "@tanstack/react-table";
import {
	createSortedRowModel,
	FlexRender,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ActionLink } from "@/components/common/action-link";
import { TableEmptyStateRow } from "@/components/common/table-empty-state-row";
import { TableLoadingState } from "@/components/common/table-loading-state";
import { TableRowLink } from "@/components/common/table-row-link";
import { TableSortButton } from "@/components/common/table-sort-button";
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
import { type AppLocale, Messages } from "@/i18n";
import {
	getClaimPriorityLabel,
	getClaimStatusLabel,
	getClaimTypeLabel,
} from "@/i18n/claim-labels";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { ClaimListDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";

interface ClaimsTableProps {
	data: ClaimListDto[];
	search?: string;
	status?: ClaimStatus;
	type?: ClaimType;
	priority?: ClaimPriority;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	isLoading?: boolean;
}

const features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
});

function buildClaimsColumns(
	locale: AppLocale,
	t: ReturnType<typeof useTranslate>,
): ColumnDef<typeof features, ClaimListDto>[] {
	return [
		{
			accessorKey: "claimNumber",
			header: () => t(Messages.claims.list.claimCode),
			cell: (info) => (
				<TableRowLink
					href={`/dashboard/claims/${info.row.original.claimNumber}`}
				>
					{info.getValue<string>()}
				</TableRowLink>
			),
			enableSorting: true,
		},
		{
			accessorFn: (row) => row.customer.companyName,
			id: "customer",
			header: () => t(Messages.claims.list.customer),
			cell: (info) => info.getValue<string>(),
			enableSorting: true,
		},
		{
			accessorFn: (row) => row.claimType.name,
			id: "type",
			header: () => t(Messages.claims.list.type),
			cell: (info) => getClaimTypeLabel(info.getValue<string>(), locale),
			enableSorting: true,
		},
		{
			accessorFn: (row) => row.order?.orderNumber ?? "—",
			id: "orderNumber",
			header: () => t(Messages.claims.list.orderCode),
			cell: (info) => info.getValue<string>(),
			enableSorting: true,
		},
		{
			accessorKey: "priority",
			header: () => t(Messages.claims.list.priority),
			cell: (info) => {
				const value = info.getValue<string | null>();
				return value ? (
					<span>{getClaimPriorityLabel(value, locale)}</span>
				) : (
					"—"
				);
			},
			enableSorting: true,
		},
		{
			accessorFn: (row) => row.claimStatus.name,
			id: "status",
			header: () => t(Messages.claims.list.status),
			cell: (info) => getClaimStatusLabel(String(info.getValue()), locale),
			enableSorting: true,
		},
		{
			accessorKey: "createdAt",
			header: () => t(Messages.claims.list.createdAt),
			cell: (info) => {
				const value = info.getValue<string>();
				return formatDisplayDate(value, locale);
			},
			enableSorting: true,
		},
	];
}

export function ClaimsTable({
	data,
	search = "",
	status,
	type,
	priority,
	sortBy,
	sortOrder,
	isLoading,
}: ClaimsTableProps) {
	const locale = useLocale();
	const t = useTranslate();
	const columns = useMemo(() => buildClaimsColumns(locale, t), [locale, t]);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const currentStatus = searchParams.get("status") ?? status ?? "ALL";
	const currentType = searchParams.get("type") ?? type ?? "ALL";
	const currentPriority = searchParams.get("priority") ?? priority ?? "ALL";

	const {
		searchValue,
		setSearchValue,
		updateQuery,
		updateSort,
		sortBy: activeSortBy,
		sortOrder: activeSortOrder,
	} = useTableQueryState({ search, sortBy, sortOrder });

	const hasActiveFilters =
		searchValue.trim().length > 0 ||
		currentStatus !== "ALL" ||
		currentType !== "ALL" ||
		currentPriority !== "ALL";

	function clearFilters() {
		setSearchValue("");
		const params = new URLSearchParams(searchParams.toString());
		for (const key of ["search", "status", "type", "priority"]) {
			params.delete(key);
		}
		const query = params.toString();
		router.replace(`${pathname}${query ? `?${query}` : ""}`, {
			scroll: false,
		});
	}

	const table = useTable({
		key: "claims-table",
		features,
		columns,
		data,
		initialState: {
			sorting: activeSortBy
				? [{ id: activeSortBy, desc: activeSortOrder === "desc" }]
				: [{ id: "createdAt", desc: true }],
		},
	});

	if (isLoading) {
		return <TableLoadingState resource="claims" />;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-4">
				<Input
					placeholder={t(Messages.claims.list.search)}
					value={searchValue}
					onChange={(event) => setSearchValue(event.target.value)}
					className="w-full max-w-sm"
				/>

				<Select
					value={currentStatus}
					onValueChange={(value) => value && updateQuery("status", value)}
				>
					<SelectTrigger className="w-full max-w-44">
						<SelectValue>
							{currentStatus === "ALL"
								? t(Messages.claims.list.allStatuses)
								: getClaimStatusLabel(currentStatus, locale)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">
							{t(Messages.claims.list.allStatuses)}
						</SelectItem>
						{Object.values(ClaimStatus).map((val) => (
							<SelectItem key={val} value={val}>
								{getClaimStatusLabel(val, locale)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={currentType}
					onValueChange={(value) => value && updateQuery("type", value)}
				>
					<SelectTrigger className="w-full max-w-48">
						<SelectValue>
							{currentType === "ALL"
								? t(Messages.claims.list.allTypes)
								: getClaimTypeLabel(currentType, locale)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">
							{t(Messages.claims.list.allTypes)}
						</SelectItem>
						{Object.values(ClaimType).map((val) => (
							<SelectItem key={val} value={val}>
								{getClaimTypeLabel(val, locale)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={currentPriority}
					onValueChange={(value) => value && updateQuery("priority", value)}
				>
					<SelectTrigger className="w-full max-w-36">
						<SelectValue>
							{currentPriority === "ALL"
								? t(Messages.claims.list.allPriorities)
								: getClaimPriorityLabel(currentPriority, locale)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">
							{t(Messages.claims.list.allPriorities)}
						</SelectItem>
						{Object.values(ClaimPriority).map((val) => (
							<SelectItem key={val} value={val}>
								{getClaimPriorityLabel(val, locale)}
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
													onClick={(event) => {
														header.column.getToggleSortingHandler()?.(event);
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
										router.push(`/dashboard/claims/${row.original.claimNumber}`)
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
									hasActiveFilters
										? t(Messages.claims.list.noMatchTitle)
										: t(Messages.claims.list.emptyTitle)
								}
								description={
									hasActiveFilters
										? t(Messages.claims.list.noMatchDescription)
										: t(Messages.claims.list.emptyDescription)
								}
								action={
									hasActiveFilters ? (
										<Button variant="outline" onClick={clearFilters}>
											{t(Messages.claims.list.clearFilters)}
										</Button>
									) : (
										<ActionLink href="/dashboard/claims/new">
											<PlusIcon aria-hidden="true" className="size-4" />
											{t(Messages.claims.list.create)}
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
