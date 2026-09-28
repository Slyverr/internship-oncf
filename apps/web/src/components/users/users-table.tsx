"use client";

import { RegistrationStatus, Role } from "@ecommand/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { FlexRender, tableFeatures, useTable } from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TableEmptyStateRow } from "@/components/common/table-empty-state-row";
import { TableLoadingState } from "@/components/common/table-loading-state";
import { TableRowLink } from "@/components/common/table-row-link";
import { Badge } from "@/components/ui/badge";
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
import type { UserListDto } from "@/lib/api/generated.schemas";
import { formatEnumLabel } from "@/lib/enum-labels";
import { formatUserRole } from "@/lib/user-labels";

interface UsersTableProps {
	data: UserListDto[];
	registrationStatus?: RegistrationStatus;
	role?: Role;
	activeStatus?: "ACTIVE" | "INACTIVE";
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
			<TableRowLink href={`/dashboard/users/${info.row.original.id}`}>
				{info.getValue<string>()}
			</TableRowLink>
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
			<Badge variant="outline" className="text-xs">
				{formatUserRole(info.getValue<string>())}
			</Badge>
		),
	},
	{
		accessorKey: "employeeCode",
		header: "Employee code",
		cell: (info) => info.getValue<string | null>() ?? "—",
	},
	{
		accessorKey: "isActive",
		header: "Status",
		cell: (info) => {
			const user = info.row.original;
			if (user.registrationStatus === RegistrationStatus.PENDING) {
				return <Badge variant="outline">Awaiting review</Badge>;
			}

			if (user.registrationStatus === RegistrationStatus.REJECTED) {
				return <Badge variant="secondary">Request rejected</Badge>;
			}

			const active = user.isActive;
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
	registrationStatus,
	role,
	activeStatus,
	search = "",
	sortBy,
	sortOrder,
	isLoading,
}: UsersTableProps) {
	const router = useRouter();
	const { searchValue, setSearchValue, updateQuery, updateSort } =
		useTableQueryState({
			search,
			sortBy,
			sortOrder,
		});
	const normalizedSearch = searchValue.trim().toLowerCase();
	const filteredUsers = data.filter((user) => {
		const searchableValues = [
			user.email,
			user.firstName,
			user.lastName,
			user.employeeCode ?? "",
			user.role.name,
		];

		return (
			(!normalizedSearch ||
				searchableValues.some((value) =>
					value.toLowerCase().includes(normalizedSearch),
				)) &&
			(!registrationStatus || user.registrationStatus === registrationStatus) &&
			(!role || user.role.name === role) &&
			(!activeStatus ||
				(activeStatus === "ACTIVE" ? user.isActive : !user.isActive))
		);
	});

	const table = useTable({
		key: "users-table",
		features,
		columns,
		data: filteredUsers,
	});

	if (isLoading) {
		return <TableLoadingState resource="users" />;
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-control">
				<Input
					placeholder="Search users..."
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					className="w-full max-w-sm"
				/>
				<Select
					value={role ?? "ALL"}
					onValueChange={(value) => value && updateQuery("role", value)}
				>
					<SelectTrigger
						aria-label="Filter users by role"
						className="w-full sm:w-52"
					>
						<SelectValue>
							{role ? formatUserRole(role) : "All roles"}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All roles</SelectItem>
						{Object.values(Role).map((userRole) => (
							<SelectItem key={userRole} value={userRole}>
								{formatUserRole(userRole)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={registrationStatus ?? "ALL"}
					onValueChange={(value) =>
						value && updateQuery("registrationStatus", value)
					}
				>
					<SelectTrigger
						aria-label="Filter by registration status"
						className="w-full sm:w-52"
					>
						<SelectValue>
							{registrationStatus === RegistrationStatus.PENDING
								? "Awaiting review"
								: registrationStatus
									? formatEnumLabel(registrationStatus)
									: "All review statuses"}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All review statuses</SelectItem>
						{Object.values(RegistrationStatus).map((status) => (
							<SelectItem key={status} value={status}>
								{status === RegistrationStatus.PENDING
									? "Awaiting review"
									: status === RegistrationStatus.APPROVED
										? "Approved"
										: "Rejected"}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={activeStatus ?? "ALL"}
					onValueChange={(value) => value && updateQuery("activeStatus", value)}
				>
					<SelectTrigger
						aria-label="Filter by account status"
						className="w-full sm:w-52"
					>
						<SelectValue>
							{activeStatus === "ACTIVE"
								? "Active accounts"
								: activeStatus === "INACTIVE"
									? "Inactive accounts"
									: "All account statuses"}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All account statuses</SelectItem>
						<SelectItem value="ACTIVE">Active accounts</SelectItem>
						<SelectItem value="INACTIVE">Inactive accounts</SelectItem>
					</SelectContent>
				</Select>
				{(registrationStatus || role || activeStatus || searchValue) && (
					<Link
						href="/dashboard/users"
						className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
					>
						Clear filters
					</Link>
				)}
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
							<TableEmptyStateRow
								colSpan={columns.length}
								message="No users found."
							/>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
