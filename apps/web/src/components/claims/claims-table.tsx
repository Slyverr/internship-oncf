"use client";

import { ClaimPriority, ClaimStatus, ClaimType } from "@ecommand/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { FlexRender, tableFeatures, useTable } from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
	PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { useTableQueryState } from "@/hooks/use-table-query-state";
import { ClaimListDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";
import { formatEnumLabel } from "@/lib/enum-labels";

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

const features = tableFeatures({});

const columns: ColumnDef<typeof features, ClaimListDto>[] = [
	{
		accessorKey: "id",
		header: "Claim #",
		cell: (info) => (
			<TableRowLink href={`/dashboard/claims/${info.row.original.id}`}>
				{`#${info.getValue<number>()}`}
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
		accessorFn: (row) => row.claimType.name,
		id: "type",
		header: "Type",
		cell: (info) => formatEnumLabel(info.getValue<string>()),
	},
	{
		accessorFn: (row) => row.order?.orderNumber ?? "—",
		id: "orderNumber",
		header: "Order #",
		cell: (info) => info.getValue<string>(),
	},
	{
		accessorKey: "priority",
		header: "Priority",
		cell: (info) => {
			const value = info.getValue<string | null>();
			return value ? <span>{formatEnumLabel(value)}</span> : "—";
		},
	},
	{
		accessorFn: (row) => row.claimStatus.name,
		id: "status",
		header: "Status",
		cell: (info) => formatEnumLabel(String(info.getValue())),
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: (info) => {
			const value = info.getValue<string>();
			return formatDisplayDate(value);
		},
	},
];

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
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const currentStatus = searchParams.get("status") ?? status ?? "ALL";
	const currentType = searchParams.get("type") ?? type ?? "ALL";
	const currentPriority = searchParams.get("priority") ?? priority ?? "ALL";

	const { searchValue, setSearchValue, updateQuery, updateSort } =
		useTableQueryState({ search, sortBy, sortOrder });

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
	});

	if (isLoading) {
		return <TableLoadingState resource="claims" />;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-4">
				<Input
					placeholder="Search claims..."
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
								? "All statuses"
								: formatEnumLabel(currentStatus)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">All statuses</SelectItem>
						{Object.values(ClaimStatus).map((val) => (
							<SelectItem key={val} value={val}>
								{formatEnumLabel(val)}
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
								? "All types"
								: formatEnumLabel(currentType)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">All types</SelectItem>
						{Object.values(ClaimType).map((val) => (
							<SelectItem key={val} value={val}>
								{formatEnumLabel(val)}
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
								? "All priorities"
								: formatEnumLabel(currentPriority)}
						</SelectValue>
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">All priorities</SelectItem>
						{Object.values(ClaimPriority).map((val) => (
							<SelectItem key={val} value={val}>
								{formatEnumLabel(val)}
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
										router.push(`/dashboard/claims/${row.original.id}`)
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
										? "No claims match these filters."
										: "No claims yet."
								}
								description={
									hasActiveFilters
										? "Change or clear the selected filters to see more claims."
										: "Customer issues and their progress will appear here."
								}
								action={
									hasActiveFilters ? (
										<Button variant="outline" onClick={clearFilters}>
											Clear filters
										</Button>
									) : (
										<Link
											href="/dashboard/claims/new"
											className="inline-flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										>
											<PlusIcon aria-hidden="true" className="size-4" />
											Create a claim
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
