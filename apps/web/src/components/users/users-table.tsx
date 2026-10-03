"use client";

import { RegistrationStatus } from "@ecommand/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { FlexRender, tableFeatures, useTable } from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ActionLink } from "@/components/common/action-link";
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
	TableFrame,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTableQueryState } from "@/hooks/use-table-query-state";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import type { UserListDto } from "@/lib/api/generated.schemas";
import { filterUsers } from "@/lib/user-filters";
import { formatRegistrationStatus, formatUserRole } from "@/lib/user-labels";

interface UsersTableProps {
	data: UserListDto[];
	registrationStatus?: RegistrationStatus;
	role?: string;
	activeStatus?: "ACTIVE" | "INACTIVE";
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	isLoading?: boolean;
}

const features = tableFeatures({});

function createColumns(
	t: ReturnType<typeof useTranslate>,
	locale: ReturnType<typeof useLocale>,
): ColumnDef<typeof features, UserListDto>[] {
	return [
		{
			accessorKey: "email",
			header: t(Messages.users.list.email),
			cell: (info) => (
				<TableRowLink href={`/dashboard/users/${info.row.original.id}`}>
					{info.getValue<string>()}
				</TableRowLink>
			),
		},
		{
			accessorKey: "firstName",
			header: t(Messages.users.list.firstName),
			cell: (info) => info.getValue<string>(),
		},
		{
			accessorKey: "lastName",
			header: t(Messages.users.list.lastName),
			cell: (info) => info.getValue<string>(),
		},
		{
			accessorKey: "role.name",
			header: t(Messages.users.list.role),
			cell: (info) => (
				<Badge variant="outline" className="text-xs">
					{formatUserRole(info.getValue<string>(), locale)}
				</Badge>
			),
		},
		{
			accessorKey: "employeeCode",
			header: t(Messages.users.list.employeeCode),
			cell: (info) => info.getValue<string | null>() ?? "—",
		},
		{
			accessorKey: "isActive",
			header: t(Messages.users.list.status),
			cell: (info) => {
				const user = info.row.original;
				if (user.registrationStatus === RegistrationStatus.PENDING) {
					return (
						<Badge variant="outline">
							{formatRegistrationStatus(user.registrationStatus, locale)}
						</Badge>
					);
				}

				if (user.registrationStatus === RegistrationStatus.REJECTED) {
					return (
						<Badge variant="secondary">
							{t(Messages.users.list.requestRejected)}
						</Badge>
					);
				}

				const active = user.isActive;
				return (
					<Badge variant={active ? "default" : "secondary"}>
						{t(
							active
								? Messages.users.list.active
								: Messages.users.list.inactive,
						)}
					</Badge>
				);
			},
		},
	];
}

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
	const t = useTranslate();
	const locale = useLocale();
	const columns = useMemo(() => createColumns(t, locale), [locale, t]);
	const router = useRouter();
	const { searchValue, setSearchValue, updateQuery, updateSort } =
		useTableQueryState({
			search,
			sortBy,
			sortOrder,
		});
	const filteredUsers = filterUsers(data, {
		registrationStatus,
		role,
		activeStatus,
		search: searchValue,
	});
	const roleOptions = [
		...new Set(
			data
				.map(({ role }) => role?.name)
				.filter((name): name is string => Boolean(name)),
		),
	];
	if (role && !roleOptions.includes(role)) roleOptions.push(role);

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
					placeholder={t(Messages.users.list.search)}
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					className="w-full max-w-sm"
				/>
				<Select
					value={role ?? "ALL"}
					onValueChange={(value) => value && updateQuery("role", value)}
				>
					<SelectTrigger
						aria-label={t(Messages.users.list.filterByRole)}
						className="w-full sm:w-52"
					>
						<SelectValue>
							{role
								? formatUserRole(role, locale)
								: t(Messages.users.list.allRoles)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">
							{t(Messages.users.list.allRoles)}
						</SelectItem>
						{roleOptions.map((userRole) => (
							<SelectItem key={userRole} value={userRole}>
								{formatUserRole(userRole, locale)}
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
						aria-label={t(Messages.users.list.filterByRegistration)}
						className="w-full sm:w-52"
					>
						<SelectValue>
							{registrationStatus
								? formatRegistrationStatus(registrationStatus, locale)
								: t(Messages.users.list.allReviewStatuses)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">
							{t(Messages.users.list.allReviewStatuses)}
						</SelectItem>
						{Object.values(RegistrationStatus).map((status) => (
							<SelectItem key={status} value={status}>
								{formatRegistrationStatus(status, locale)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select
					value={activeStatus ?? "ALL"}
					onValueChange={(value) => value && updateQuery("activeStatus", value)}
				>
					<SelectTrigger
						aria-label={t(Messages.users.list.filterByAccount)}
						className="w-full sm:w-52"
					>
						<SelectValue>
							{activeStatus === "ACTIVE"
								? t(Messages.users.list.activeAccounts)
								: activeStatus === "INACTIVE"
									? t(Messages.users.list.inactiveAccounts)
									: t(Messages.users.list.allAccountStatuses)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">
							{t(Messages.users.list.allAccountStatuses)}
						</SelectItem>
						<SelectItem value="ACTIVE">
							{t(Messages.users.list.activeAccounts)}
						</SelectItem>
						<SelectItem value="INACTIVE">
							{t(Messages.users.list.inactiveAccounts)}
						</SelectItem>
					</SelectContent>
				</Select>
				{(registrationStatus || role || activeStatus || searchValue) && (
					<ActionLink href="/dashboard/users">
						{t(Messages.users.list.clearFilters)}
					</ActionLink>
				)}
			</div>

			<TableFrame>
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
								message={t(Messages.users.list.noResults)}
							/>
						)}
					</TableBody>
				</Table>
			</TableFrame>
		</div>
	);
}
