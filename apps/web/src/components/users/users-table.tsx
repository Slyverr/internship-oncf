"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FlexRender, tableFeatures, useTable } from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import type { UserListDto } from "@/lib/api/generated.schemas";

interface UsersTableProps {
	data: UserListDto[];
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	isLoading?: boolean;
}

const features = tableFeatures({});

const columns: ColumnDef<typeof features, UserListDto>[] = [
	{
		accessorKey: "email",
		header: "Email",
		cell: (info) => (
			<span className="font-medium text-primary">
				{info.getValue<string>()}
			</span>
		),
	},
	{
		accessorKey: "firstName",
		header: "First Name",
		cell: (info) => info.getValue<string>(),
	},
	{
		accessorKey: "lastName",
		header: "Last Name",
		cell: (info) => info.getValue<string>(),
	},
	{
		accessorKey: "role.name",
		header: "Role",
		cell: (info) => (
			<Badge variant="outline" className="uppercase font-mono text-xs">
				{info.getValue<string>()}
			</Badge>
		),
	},
	{
		accessorKey: "employeeId",
		header: "Employee ID",
		cell: (info) => info.getValue<string | null>() ?? "—",
	},
	{
		accessorKey: "isActive",
		header: "Status",
		cell: (info) => {
			const active = info.getValue<boolean>();
			return (
				<Badge variant={active ? "default" : "secondary"}>
					{active ? "Active" : "Inactive"}
				</Badge>
			);
		},
	},
];

export function UsersTable({
	data,
	search = "",
	sortBy,
	sortOrder,
	isLoading,
}: UsersTableProps) {
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

	const updateSort = (column: string) => {
		const params = new URLSearchParams(window.location.search);
		const nextOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
		params.set("sortBy", column);
		params.set("sortOrder", nextOrder);
		router.push(`?${params.toString()}`);
	};

	const table = useTable({
		key: "users-table",
		features,
		columns,
		data,
	});

	if (isLoading) {
		return <div className="p-4 text-center">Loading users...</div>;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-4">
				<Input
					placeholder="Search users..."
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
										router.push(`/dashboard/users/${row.original.id}`)
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
									No users found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
