"use client";

import { ClaimPriority, ClaimStatus, ClaimType } from "@ecommand/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { FlexRender, tableFeatures, useTable } from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ClaimListDto } from "@/lib/api/generated.schemas";

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
			<span className="font-medium text-primary">
				#{info.getValue<number>()}
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
		accessorFn: (row) => row.claimType.name,
		id: "type",
		header: "Type",
		cell: (info) => info.getValue<string>(),
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
			return value ? (
				<span className="capitalize">{value.toLowerCase()}</span>
			) : (
				"—"
			);
		},
	},
	{
		accessorFn: (row) => row.claimStatus.name,
		id: "status",
		header: "Status",
		cell: (info) => (
			<span className="capitalize">
				{String(info.getValue()).toLowerCase()}
			</span>
		),
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: (info) => {
			const value = info.getValue<string>();
			return value ? new Date(value).toLocaleDateString() : "—";
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
	const searchParams = useSearchParams();

	const currentStatus = searchParams.get("status") ?? status ?? "ALL";
	const currentType = searchParams.get("type") ?? type ?? "ALL";
	const currentPriority = searchParams.get("priority") ?? priority ?? "ALL";

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

	const updateQuery = (key: string, value: string) => {
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
		key: "claims-table",
		features,
		columns,
		data,
	});

	if (isLoading) {
		return <div>Loading claims…</div>;
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
						<SelectValue placeholder="Filter by status" />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">All statuses</SelectItem>
						{Object.values(ClaimStatus).map((val) => (
							<SelectItem key={val} value={val}>
								{val}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={currentType}
					onValueChange={(value) => value && updateQuery("type", value)}
				>
					<SelectTrigger className="w-full max-w-48">
						<SelectValue placeholder="Filter by type" />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">All types</SelectItem>
						{Object.values(ClaimType).map((val) => (
							<SelectItem key={val} value={val}>
								{val}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={currentPriority}
					onValueChange={(value) => value && updateQuery("priority", value)}
				>
					<SelectTrigger className="w-full max-w-36">
						<SelectValue placeholder="Filter by priority" />
					</SelectTrigger>

					<SelectContent>
						<SelectItem value="ALL">All priorities</SelectItem>
						{Object.values(ClaimPriority).map((val) => (
							<SelectItem key={val} value={val}>
								{val}
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
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="py-8 text-center"
								>
									No claims found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
