"use client";

import { Permission } from "@ecommand/shared";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import {
	ArrowRightIcon,
	ClipboardListIcon,
	LoaderCircleIcon,
	PlusIcon,
	RefreshCwIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ActionLink } from "@/components/common/action-link";
import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Messages } from "@/i18n";
import { getClaimTypeLabel } from "@/i18n/claim-labels";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import {
	getClaimStatusLabel,
	getOrderStatusLabel,
	getProgramStatusLabel,
} from "@/i18n/status-labels";
import {
	getDashboardQuickActions,
	getPendingClientRegistrations,
	getUserAccountOverview,
} from "@/lib/action-visibility";
import { useClaimsControllerFindAll } from "@/lib/api/claims";
import type { UserListDto } from "@/lib/api/generated.schemas";
import {
	useOrdersControllerFindAll,
	useOrdersControllerFindEligibleForPrograms,
} from "@/lib/api/orders";
import { useProgramsControllerFindAll } from "@/lib/api/programs";
import { useUsersControllerFindAll } from "@/lib/api/users";
import {
	getDashboardRegistrationCounts,
	getDashboardRoleCounts,
} from "@/lib/dashboard-insights";
import { formatMediumDate, formatMonthLabel } from "@/lib/date-utils";
import type { OrderReport } from "@/lib/reports";
import { getOrderReport } from "@/lib/reports";
import { formatUserRole } from "@/lib/user-labels";
import { useAuth } from "@/providers/auth-provider";

interface DashboardItem {
	id: number;
	title: string;
	description: string;
	status?: string;
	date: string;
	href: string;
}

interface RecentSectionProps {
	title: string;
	description: string;
	href: string;
	emptyMessage: string;
	emptyAction?: { label: string; href: string };
	items: DashboardItem[];
	isLoading: boolean;
	isError: boolean;
	isFetching: boolean;
	onRetry: () => void;
}

function RecentSection({
	title,
	description,
	href,
	emptyMessage,
	emptyAction,
	items,
	isLoading,
	isError,
	isFetching,
	onRetry,
}: RecentSectionProps) {
	const t = useTranslate();
	const locale = useLocale();
	return (
		<Card className="h-56">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-control">
					<div className="grid min-w-0 flex-1 gap-compact">
						<CardTitle>{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
					<ActionLink
						href={href}
						className="shrink-0 gap-compact"
						aria-label={t(Messages.dashboard.recent.viewAll, {
							section: title.toLowerCase(),
						})}
					>
						{t(Messages.dashboard.recent.viewAllLabel)}{" "}
						<ArrowRightIcon className="size-4" />
					</ActionLink>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="text-sm text-muted-foreground">
						{t(Messages.dashboard.recent.loading)}
					</p>
				) : isError ? (
					<InlineQueryRetry
						message={t(Messages.dashboard.recent.loadFailed)}
						retryLabel={t(Messages.common.actions.retry)}
						isFetching={isFetching}
						onRetry={onRetry}
					/>
				) : items.length === 0 ? (
					<div className="grid gap-control">
						<p className="text-sm text-muted-foreground">{emptyMessage}</p>
						{emptyAction && (
							<ActionLink href={emptyAction.href} className="gap-compact">
								{emptyAction.label}
								<ArrowRightIcon aria-hidden="true" className="size-4" />
							</ActionLink>
						)}
					</div>
				) : (
					<ul className="grid gap-4 divide-y-0">
						{items.map((item) => (
							<li className="border-0" key={item.id}>
								<Link
									href={item.href}
									className="grid min-w-0 gap-2 hover:text-primary"
								>
									<span className="flex min-w-0 items-center justify-between gap-2">
										<span className="block min-w-0 truncate font-medium">
											{item.title}
										</span>
										{item.status && (
											<Badge variant="outline" className="shrink-0">
												{item.status}
											</Badge>
										)}
									</span>
									<span className="flex min-w-0 items-center justify-between gap-2">
										<span className="block min-w-0 truncate text-meta text-muted-foreground">
											{item.description}
										</span>
										<time
											dateTime={item.date}
											className="shrink-0 text-meta text-muted-foreground"
										>
											{formatMediumDate(item.date, locale)}
										</time>
									</span>
								</Link>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

function ReadyOrdersSection({
	orders,
	isLoading,
	isError,
	isFetching,
	onRetry,
}: {
	orders: { id: number; orderNumber: string }[];
	isLoading: boolean;
	isError: boolean;
	isFetching: boolean;
	onRetry: () => void;
}) {
	const t = useTranslate();
	if (!isLoading && !isError && orders.length === 0) return null;

	return (
		<Card size="sm">
			<CardHeader>
				<div className="workspace-insight-heading min-w-0">
					<CardTitle>{t(Messages.dashboard.readyOrders.title)}</CardTitle>
					{!isLoading && !isError && orders.length > 0 && (
						<ActionLink
							href="/dashboard/orders?eligibleForProgram=true"
							className="shrink-0 gap-compact"
						>
							{t(Messages.dashboard.readyOrders.browse)}
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</ActionLink>
					)}
					<CardDescription>
						{t(Messages.dashboard.readyOrders.description)}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="text-sm text-muted-foreground">
						{t(Messages.dashboard.readyOrders.checking)}
					</p>
				) : isError ? (
					<InlineQueryRetry
						message={t(Messages.dashboard.readyOrders.checkFailed)}
						retryLabel={t(Messages.dashboard.readyOrders.tryAgain)}
						isFetching={isFetching}
						onRetry={onRetry}
					/>
				) : (
					<div
						className={`grid gap-control ${orders.length > 1 ? "@2xl/workspace:grid-cols-2" : "grid-cols-1"}`}
					>
						{orders.map((order) => (
							<Link
								key={order.id}
								href={`/dashboard/programs/new?orderNumber=${order.orderNumber}&search=${encodeURIComponent(order.orderNumber)}`}
								aria-label={t(
									Messages.dashboard.readyOrders.createProgramForOrder,
									{ orderCode: order.orderNumber },
								)}
								className="flex min-h-11 min-w-0 items-center justify-between gap-control rounded-md border px-control py-compact text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<span className="min-w-0 truncate font-medium">
									{order.orderNumber}
								</span>
								<span className="shrink-0 text-muted-foreground">
									<ArrowRightIcon aria-hidden="true" className="size-4" />
								</span>
							</Link>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function UserAccountsSection({
	users,
	pendingUsers,
	canReviewUsers,
	isLoading,
	isError,
	isFetching,
	onRetry,
}: {
	users: UserListDto[];
	pendingUsers: ReturnType<typeof getPendingClientRegistrations>;
	canReviewUsers: boolean;
	isLoading: boolean;
	isError: boolean;
	isFetching: boolean;
	onRetry: () => void;
}) {
	const t = useTranslate();
	const locale = useLocale();
	const summary = getUserAccountOverview(users);
	const roleCounts = getDashboardRoleCounts(users);
	const maxRoleCount = Math.max(1, ...roleCounts.map(({ count }) => count));
	const roleChartLabel = roleCounts
		.map(({ name, count }) =>
			t(Messages.dashboard.accounts.roleCount, {
				role: formatUserRole(name, locale),
				count,
			}),
		)
		.join(", ");
	const metrics = [
		{ label: Messages.dashboard.accounts.total, value: summary.total },
		{ label: Messages.dashboard.accounts.active, value: summary.active },
		{ label: Messages.dashboard.accounts.pending, value: summary.pending },
		{ label: Messages.dashboard.accounts.inactive, value: summary.inactive },
	];
	return (
		<Card size="sm">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-control">
					<div className="grid min-w-0 gap-compact">
						<CardTitle>{t(Messages.dashboard.accounts.title)}</CardTitle>
						<CardDescription>
							{t(Messages.dashboard.accounts.description)}
						</CardDescription>
					</div>
					<ActionLink href="/dashboard/users" className="shrink-0 gap-compact">
						{t(Messages.dashboard.manageUsers)}
						<ArrowRightIcon aria-hidden="true" className="size-4" />
					</ActionLink>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="text-sm text-muted-foreground">
						{t(Messages.dashboard.accounts.loading)}
					</p>
				) : isError ? (
					<InlineQueryRetry
						message={t(Messages.dashboard.accounts.loadFailed)}
						retryLabel={t(Messages.common.actions.retry)}
						isFetching={isFetching}
						onRetry={onRetry}
					/>
				) : (
					<div className="grid min-w-0 gap-6 @3xl/workspace:grid-cols-2 @6xl/workspace:grid-cols-3">
						<div className="@container/account-metrics min-w-0">
							<dl className="grid grid-cols-2 gap-x-4 gap-y-6 @2xl/account-metrics:grid-cols-4">
								{metrics.map(({ label, value }) => (
									<div
										key={label}
										className="grid min-w-0 content-start gap-compact"
									>
										<dt className="text-meta text-muted-foreground">
											{t(label)}
										</dt>
										<dd className="text-2xl font-semibold tabular-nums">
											{value}
										</dd>
									</div>
								))}
							</dl>
						</div>
						{roleCounts.length > 0 && (
							<section className="grid min-w-0 content-start gap-control border-t border-border/70 pt-4 @3xl/workspace:border-l @3xl/workspace:border-t-0 @3xl/workspace:pl-6 @3xl/workspace:pt-0">
								<h3 className="text-sm font-medium">
									{t(Messages.dashboard.accounts.byAccessProfile)}
								</h3>
								<div
									role="img"
									aria-label={t(Messages.dashboard.accounts.roleChartLabel, {
										roles: roleChartLabel,
									})}
									className="grid gap-control"
								>
									{roleCounts.map(({ name, count }) => (
										<div key={name} className="grid gap-compact">
											<div className="flex min-w-0 items-center justify-between gap-control text-sm">
												<span className="truncate">
													{formatUserRole(name, locale)}
												</span>
												<span className="shrink-0 tabular-nums text-muted-foreground">
													{count}
												</span>
											</div>
											<div className="h-2 overflow-hidden rounded-full bg-muted">
												<div
													aria-hidden="true"
													className="h-full rounded-full bg-primary"
													style={{ width: `${(count / maxRoleCount) * 100}%` }}
												/>
											</div>
										</div>
									))}
								</div>
							</section>
						)}
						{canReviewUsers && (
							<section className="grid min-w-0 content-start gap-control border-t border-border/70 pt-4 @3xl/workspace:col-span-2 @3xl/workspace:border-t @6xl/workspace:col-span-1 @6xl/workspace:border-l @6xl/workspace:border-t-0 @6xl/workspace:pl-6 @6xl/workspace:pt-0">
								<div className="grid min-w-0 gap-control @6xl/workspace:flex @6xl/workspace:items-center @6xl/workspace:justify-between">
									<h3 className="text-sm font-medium">
										{t(Messages.dashboard.registrations.title)}
									</h3>
									<div className="flex shrink-0 items-center gap-compact">
										<Badge variant="outline" className="tabular-nums">
											{t(Messages.dashboard.registrations.pending, {
												count: pendingUsers.length,
											})}
										</Badge>
										<ActionLink
											href="/dashboard/users?registrationStatus=PENDING&role=CLIENT_REPRESENTATIVE"
											className="min-h-11 shrink-0 gap-compact"
										>
											{t(Messages.dashboard.registrations.viewAll)}
											<ArrowRightIcon aria-hidden="true" className="size-4" />
										</ActionLink>
									</div>
								</div>
								{pendingUsers.length > 0 ? (
									<ul className="grid gap-control">
										{pendingUsers.slice(0, 3).map((user) => (
											<li key={user.id}>
												<Link
													href={`/dashboard/users/${user.id}`}
													aria-label={t(
														Messages.dashboard.registrations.review,
														{
															name: `${user.firstName} ${user.lastName}`,
														},
													)}
													className="flex min-h-11 min-w-0 items-center justify-between gap-control rounded-md border px-control py-compact text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
												>
													<span className="grid min-w-0 gap-compact">
														<span className="truncate font-medium">
															{user.firstName} {user.lastName}
														</span>
														<span className="truncate text-xs text-muted-foreground">
															{user.email}
														</span>
													</span>
													<ArrowRightIcon
														aria-hidden="true"
														className="size-4 shrink-0 text-muted-foreground"
													/>
												</Link>
											</li>
										))}
									</ul>
								) : (
									<p className="text-sm text-muted-foreground">
										{t(Messages.dashboard.registrations.description)}
									</p>
								)}
							</section>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function UserRegistrationActivitySection({ users }: { users: UserListDto[] }) {
	const t = useTranslate();
	const locale = useLocale();
	const months = getDashboardRegistrationCounts(users).map(
		({ key, count }) => ({
			key,
			count,
			label: formatMonthLabel(new Date(`${key}-01T00:00:00.000Z`), locale),
		}),
	);
	const total = months.reduce((sum, month) => sum + month.count, 0);
	const maxCount = Math.max(1, ...months.map(({ count }) => count));
	const chartLabel = months
		.map(({ label, count }) =>
			t(Messages.dashboard.accounts.registrationActivityMonthCount, {
				month: label,
				count,
			}),
		)
		.join(", ");

	return (
		<Card size="sm">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-control">
					<div className="grid min-w-0 gap-compact">
						<CardTitle>
							{t(Messages.dashboard.accounts.registrationActivityTitle)}
						</CardTitle>
						<CardDescription>
							{t(Messages.dashboard.accounts.registrationActivityDescription)}
						</CardDescription>
					</div>
					<div className="grid shrink-0 text-right">
						<span className="text-meta text-muted-foreground">
							{t(Messages.dashboard.accounts.registrationActivityTotal)}
						</span>
						<span className="text-3xl font-semibold tabular-nums">{total}</span>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{total === 0 ? (
					<div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
						{t(Messages.dashboard.accounts.registrationActivityEmpty)}
					</div>
				) : (
					<div
						role="img"
						aria-label={t(
							Messages.dashboard.accounts.registrationActivityChartLabel,
							{ months: chartLabel },
						)}
						className="grid grid-cols-6 items-end gap-control"
					>
						{months.map(({ key, label, count }) => (
							<div key={key} className="grid min-w-0 gap-compact text-center">
								<span className="text-meta tabular-nums text-muted-foreground">
									{count}
								</span>
								<div className="flex h-24 items-end justify-center border-b border-border/70">
									<div
										aria-hidden="true"
										className={`w-1/2 rounded-t-sm bg-primary ${count > 0 ? "min-h-2" : ""}`}
										style={{ height: `${(count / maxCount) * 100}%` }}
									/>
								</div>
								<span className="text-xs text-muted-foreground">{label}</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function getRecentOrderPeriod() {
	const today = new Date();
	const firstMonth = new Date(
		Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 5, 1),
	);

	return {
		from: firstMonth.toISOString().slice(0, 10),
		to: today.toISOString().slice(0, 10),
	};
}

function getRecentOrderMonths(
	from: string,
	byMonth: { month: string; count: number }[],
	locale: ReturnType<typeof useLocale>,
) {
	const firstMonth = new Date(`${from.slice(0, 7)}-01T00:00:00.000Z`);
	const counts = new Map(byMonth.map(({ month, count }) => [month, count]));

	return Array.from({ length: 6 }, (_, index) => {
		const month = new Date(
			Date.UTC(
				firstMonth.getUTCFullYear(),
				firstMonth.getUTCMonth() + index,
				1,
			),
		);
		const key = month.toISOString().slice(0, 7);

		return {
			key,
			label: formatMonthLabel(month, locale),
			count: counts.get(key) ?? 0,
		};
	});
}

function OrderOverviewSection({
	report,
	from,
}: {
	report: UseQueryResult<OrderReport, Error>;
	from: string;
}) {
	const t = useTranslate();
	const locale = useLocale();
	const months = getRecentOrderMonths(from, report.data?.byMonth ?? [], locale);
	const maxCount = Math.max(1, ...months.map(({ count }) => count));

	const statuses = report.data?.byStatus ?? [];
	const statusTotal = statuses.reduce((sum, status) => sum + status.count, 0);
	const maxStatusCount = Math.max(1, ...statuses.map(({ count }) => count));
	const statusLabel = statuses
		.map(({ name, count }) =>
			t(Messages.dashboard.activity.statusCount, {
				status: getOrderStatusLabel(name, locale),
				count,
			}),
		)
		.join(", ");

	return (
		<Card size="sm">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-control">
					<div className="grid min-w-0 gap-compact">
						<CardTitle>{t(Messages.dashboard.activity.title)}</CardTitle>
						<CardDescription>
							{t(Messages.dashboard.activity.description)}
						</CardDescription>
					</div>
					<div className="grid shrink-0 text-right">
						<span className="text-meta text-muted-foreground">
							{t(Messages.dashboard.activity.total)}
						</span>
						<span className="text-3xl font-semibold tabular-nums">
							{report.data?.totalOrders ?? "—"}
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{report.isPending ? (
					<div
						role="status"
						className="flex h-32 items-center justify-center gap-control text-sm text-muted-foreground"
					>
						<LoaderCircleIcon
							aria-hidden="true"
							className="size-4 animate-spin motion-reduce:animate-none"
						/>
						{t(Messages.dashboard.activity.loading)}
					</div>
				) : report.isError ? (
					<div
						role="alert"
						className="flex min-h-32 flex-wrap items-center justify-between gap-control"
					>
						<p className="text-sm text-destructive">
							{t(Messages.dashboard.activity.loadFailed)}
						</p>
						<Button
							variant="outline"
							disabled={report.isFetching}
							onClick={() => void report.refetch()}
						>
							{report.isFetching ? (
								<LoaderCircleIcon
									aria-hidden="true"
									className="animate-spin motion-reduce:animate-none"
								/>
							) : (
								<RefreshCwIcon aria-hidden="true" />
							)}
							{t(
								report.isFetching
									? Messages.dashboard.activity.retrying
									: Messages.dashboard.activity.retry,
							)}
						</Button>
					</div>
				) : report.data.totalOrders === 0 ? (
					<div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
						{t(Messages.dashboard.activity.empty)}
					</div>
				) : (
					<div className="grid gap-6 @4xl/workspace:grid-cols-2">
						<section className="grid min-w-0 content-start gap-control">
							<div
								role="img"
								aria-label={t(Messages.dashboard.activity.chartLabel, {
									months: months
										.map(({ label, count }) =>
											t(Messages.dashboard.activity.monthCount, {
												month: label,
												count,
											}),
										)
										.join(", "),
								})}
								className="grid grid-cols-6 items-end gap-control"
							>
								{months.map(({ key, label, count }) => (
									<div
										key={key}
										className="grid min-w-0 gap-compact text-center"
									>
										<span className="text-meta tabular-nums text-muted-foreground">
											{count}
										</span>
										<div className="flex h-24 items-end justify-center border-b border-border/70">
											<div
												aria-hidden="true"
												className={`w-1/2 rounded-t-sm bg-primary ${count > 0 ? "min-h-2" : ""}`}
												style={{ height: `${(count / maxCount) * 100}%` }}
											/>
										</div>
										<span className="text-xs text-muted-foreground">
											{label}
										</span>
									</div>
								))}
							</div>
						</section>
						<section className="grid min-w-0 content-start gap-control">
							<h3 className="text-sm font-medium">
								{t(Messages.dashboard.activity.statusTitle)}
							</h3>
							{statusTotal === 0 ? (
								<p className="text-sm text-muted-foreground">
									{t(Messages.dashboard.activity.statusEmpty)}
								</p>
							) : (
								<div
									role="img"
									aria-label={t(Messages.dashboard.activity.statusChartLabel, {
										statuses: statusLabel,
									})}
									className="grid gap-control"
								>
									{statuses.map(({ id, name, count }) => (
										<div key={id} className="grid gap-compact">
											<div className="flex items-center justify-between gap-control text-sm">
												<span className="truncate">
													{getOrderStatusLabel(name, locale)}
												</span>
												<span className="shrink-0 tabular-nums text-muted-foreground">
													{count}
												</span>
											</div>
											<div className="h-2 overflow-hidden rounded-full bg-muted">
												<div
													aria-hidden="true"
													className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
													style={{
														width: `${(count / maxStatusCount) * 100}%`,
													}}
												/>
											</div>
										</div>
									))}
								</div>
							)}
						</section>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function DashboardOverview() {
	const t = useTranslate();
	const locale = useLocale();
	const { profile, hasPermission } = useAuth();
	const quickActions = getDashboardQuickActions(hasPermission);
	const canReadOrders = hasPermission(Permission.ORDERS_READ);
	const canCreateOrders = hasPermission(Permission.ORDERS_CREATE);
	const canCreatePrograms = hasPermission(Permission.PROGRAMS_CREATE);
	const canReadPrograms = hasPermission(Permission.PROGRAMS_READ);
	const canReadClaims = hasPermission(Permission.CLAIMS_READ);
	const canCreateClaims = hasPermission(Permission.CLAIMS_CREATE);
	const canReadReports = hasPermission(Permission.REPORTS_READ);
	const canReadUsers = hasPermission(Permission.USERS_READ);
	const canReviewUsers = canReadUsers && hasPermission(Permission.USERS_UPDATE);
	const canManageReferenceData = hasPermission(Permission.CATALOG_MANAGE);
	const canManageAccessProfiles = hasPermission(Permission.ROLES_MANAGE);
	const showReadyOrders = canReadOrders && canCreatePrograms;
	const recentSectionCount =
		Number(canReadOrders) + Number(canReadPrograms) + Number(canReadClaims);
	const recentGridColumns =
		recentSectionCount === 3
			? "@6xl/workspace:grid-cols-3"
			: recentSectionCount === 2
				? "@5xl/workspace:grid-cols-2"
				: "grid-cols-1";
	const recentRailClassName =
		recentSectionCount > 1 ? "workspace-recent-rail" : "grid gap-4";

	const ordersQuery = useOrdersControllerFindAll(
		{ page: 1, limit: 2, sortBy: "createdAt", sortOrder: "desc" },
		{ query: { enabled: canReadOrders } },
	);
	const readyOrdersQuery = useOrdersControllerFindEligibleForPrograms(
		{ page: 1, limit: 4 },
		{
			query: {
				enabled: canReadOrders && canCreatePrograms,
			},
		},
	);
	const showReadyOrdersCard =
		showReadyOrders &&
		(readyOrdersQuery.isLoading ||
			readyOrdersQuery.isError ||
			(readyOrdersQuery.data?.length ?? 0) > 0);
	const programsQuery = useProgramsControllerFindAll(
		{ page: 1, limit: 2, sortBy: "createdAt", sortOrder: "desc" },
		{ query: { enabled: canReadPrograms } },
	);
	const claimsQuery = useClaimsControllerFindAll(
		{ page: 1, limit: 2, sortBy: "createdAt", sortOrder: "desc" },
		{ query: { enabled: canReadClaims } },
	);
	const [activityPeriod] = useState(getRecentOrderPeriod);
	const orderReport = useQuery<OrderReport>({
		queryKey: ["dashboard-order-activity", activityPeriod],
		queryFn: () => getOrderReport(activityPeriod),
		enabled: canReadReports,
	});
	const usersQuery = useUsersControllerFindAll({
		query: { enabled: canReadUsers },
	});
	const pendingRegistrations = getPendingClientRegistrations(
		usersQuery.data ?? [],
		canReviewUsers,
	);

	const sections = [
		canReadOrders && (
			<RecentSection
				key="orders"
				title={t(Messages.dashboard.orders.title)}
				description={t(Messages.dashboard.orders.description)}
				href="/dashboard/orders"
				emptyMessage={t(Messages.dashboard.orders.empty)}
				{...(canCreateOrders && {
					emptyAction: {
						label: t(Messages.dashboard.orders.create),
						href: "/dashboard/orders/new",
					},
				})}
				isLoading={ordersQuery.isLoading}
				isError={ordersQuery.isError}
				isFetching={ordersQuery.isFetching}
				onRetry={() => void ordersQuery.refetch()}
				items={(ordersQuery.data ?? []).map((order) => ({
					id: order.id,
					title: order.orderNumber,
					description: t(Messages.dashboard.orders.itemDescription, {
						customer: order.customer.companyName,
						good: order.good.name,
						quantity: order.quantityDemanded,
						unit: order.unit.name,
					}),
					status: getOrderStatusLabel(order.orderStatus.name, locale),
					date: order.createdAt,
					href: `/dashboard/orders/${order.orderNumber}`,
				}))}
			/>
		),
		canReadPrograms && (
			<RecentSection
				key="programs"
				title={t(Messages.dashboard.programs.title)}
				description={t(Messages.dashboard.programs.description)}
				href="/dashboard/programs"
				emptyMessage={
					canReadOrders && canCreatePrograms
						? t(Messages.dashboard.programs.emptyWithEligibleOrders)
						: t(Messages.dashboard.programs.empty)
				}
				isLoading={programsQuery.isLoading}
				isError={programsQuery.isError}
				isFetching={programsQuery.isFetching}
				onRetry={() => void programsQuery.refetch()}
				items={(programsQuery.data ?? []).map((program) => ({
					id: program.id,
					title: program.programNumber,
					description: t(Messages.dashboard.programs.itemDescription, {
						orderCode: program.order.orderNumber,
						quantity: program.quantityPlanned,
					}),
					status: getProgramStatusLabel(program.programStatus.name, locale),
					date: program.createdAt,
					href: `/dashboard/programs/${program.programNumber}`,
				}))}
			/>
		),
		canReadClaims && (
			<RecentSection
				key="claims"
				title={t(Messages.dashboard.claims.title)}
				description={t(Messages.dashboard.claims.description)}
				href="/dashboard/claims"
				emptyMessage={t(Messages.dashboard.claims.empty)}
				{...(canCreateClaims && {
					emptyAction: {
						label: t(Messages.dashboard.claims.create),
						href: "/dashboard/claims/new",
					},
				})}
				isLoading={claimsQuery.isLoading}
				isError={claimsQuery.isError}
				isFetching={claimsQuery.isFetching}
				onRetry={() => void claimsQuery.refetch()}
				items={(claimsQuery.data ?? []).map((claim) => ({
					id: claim.id,
					title: claim.claimNumber,
					description: t(Messages.dashboard.claims.itemDescription, {
						customer: claim.customer.companyName,
						type: getClaimTypeLabel(claim.claimType.name, locale),
					}),
					status: getClaimStatusLabel(claim.claimStatus.name, locale),
					date: claim.createdAt,
					href: `/dashboard/claims/${claim.claimNumber}`,
				}))}
			/>
		),
	].filter(Boolean);

	return (
		<section className="grid w-full min-w-0 gap-6">
			<PageHeader
				title={t(Messages.dashboard.welcome, {
					name: `${profile.firstName} ${profile.lastName}`,
				})}
				description={t(Messages.dashboard.description)}
			>
				{quickActions.map((action, index) => (
					<Link
						key={action.type}
						className={buttonVariants({
							variant: index === 0 ? "default" : "outline",
						})}
						href={action.href}
					>
						<PlusIcon aria-hidden="true" />
						{t(
							action.type === "order"
								? Messages.dashboard.quickActions.createOrder
								: Messages.dashboard.quickActions.createClaim,
						)}
					</Link>
				))}
			</PageHeader>

			{canReadUsers && (
				<UserAccountsSection
					users={usersQuery.data ?? []}
					pendingUsers={pendingRegistrations}
					canReviewUsers={canReviewUsers}
					isLoading={usersQuery.isLoading}
					isError={usersQuery.isError}
					isFetching={usersQuery.isFetching}
					onRetry={() => void usersQuery.refetch()}
				/>
			)}

			{(canReadUsers || canReadReports) && (
				<section
					aria-label={t(Messages.dashboard.insightsLabel)}
					className={`grid min-w-0 gap-6 ${canReadUsers && canReadReports ? "@6xl/workspace:grid-cols-2" : "grid-cols-1"}`}
				>
					{canReadUsers && !usersQuery.isLoading && !usersQuery.isError && (
						<UserRegistrationActivitySection users={usersQuery.data ?? []} />
					)}
					{canReadReports && canReadUsers && (
						<OrderOverviewSection
							report={orderReport}
							from={activityPeriod.from}
						/>
					)}
				</section>
			)}

			{(showReadyOrdersCard || (canReadReports && !canReadUsers)) && (
				<section
					aria-label={t(Messages.dashboard.insightsLabel)}
					className={`grid min-w-0 gap-6 ${showReadyOrdersCard && canReadReports ? "@4xl/workspace:grid-cols-2" : "grid-cols-1"}`}
				>
					{showReadyOrdersCard && (
						<ReadyOrdersSection
							orders={readyOrdersQuery.data ?? []}
							isLoading={readyOrdersQuery.isLoading}
							isError={readyOrdersQuery.isError}
							isFetching={readyOrdersQuery.isFetching}
							onRetry={() => void readyOrdersQuery.refetch()}
						/>
					)}
					{canReadReports && !canReadUsers && (
						<OrderOverviewSection
							report={orderReport}
							from={activityPeriod.from}
						/>
					)}
				</section>
			)}

			{sections.length > 0 ? (
				<>
					<section
						aria-label={t(Messages.dashboard.recentActivityLabel)}
						tabIndex={recentSectionCount > 1 ? 0 : undefined}
						className={`${recentRailClassName} ${recentGridColumns} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
					>
						{sections}
					</section>
					{recentSectionCount > 1 && (
						<p className="workspace-scroll-hint text-meta text-muted-foreground">
							{t(Messages.dashboard.recentScrollHint)}
						</p>
					)}
				</>
			) : canReadUsers || canReadReports || showReadyOrders ? null : (
				<Card>
					<CardContent className="flex flex-col items-start justify-between gap-4 py-control sm:flex-row sm:items-center">
						<div className="flex min-w-0 items-start gap-control">
							<ClipboardListIcon
								aria-hidden="true"
								className="mt-1 size-5 shrink-0 text-muted-foreground"
							/>
							<div className="grid min-w-0 gap-compact">
								<p className="font-medium">
									{t(
										canManageReferenceData || canManageAccessProfiles
											? Messages.dashboard.workspaceTitle
											: Messages.dashboard.noListsTitle,
									)}
								</p>
								<p className="text-sm text-muted-foreground">
									{t(
										canManageReferenceData || canManageAccessProfiles
											? Messages.dashboard.workspaceDescription
											: Messages.dashboard.noListsDescription,
									)}
								</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-control">
							{canReadReports && (
								<Link
									href="/dashboard/reports"
									className={buttonVariants({ variant: "outline" })}
								>
									{t(Messages.dashboard.viewReports)}
								</Link>
							)}
							{canReadUsers && (
								<Link
									href="/dashboard/users"
									className={buttonVariants({
										variant: canReadReports ? "outline" : "default",
									})}
								>
									{t(Messages.dashboard.manageUsers)}
								</Link>
							)}
							{canManageAccessProfiles && (
								<Link
									className={buttonVariants({ variant: "outline" })}
									href="/dashboard/roles"
								>
									{t(Messages.dashboard.manageAccessProfiles)}
								</Link>
							)}
							{canManageReferenceData && (
								<Link
									className={buttonVariants({ variant: "outline" })}
									href="/dashboard/catalog"
								>
									{t(Messages.dashboard.manageReferenceData)}
								</Link>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</section>
	);
}
