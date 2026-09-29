"use client";

import { Permission } from "@ecommand/shared";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowRightIcon,
	ClipboardListIcon,
	LoaderCircleIcon,
	PlusIcon,
	RefreshCwIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import {
	getDashboardQuickActions,
	getPendingClientRegistrations,
} from "@/lib/action-visibility";
import { useClaimsControllerFindAll } from "@/lib/api/claims";
import {
	useOrdersControllerFindAll,
	useOrdersControllerFindEligibleForPrograms,
} from "@/lib/api/orders";
import { useProgramsControllerFindAll } from "@/lib/api/programs";
import { useUsersControllerFindAll } from "@/lib/api/users";
import { formatEnumLabel } from "@/lib/enum-labels";
import { getOrderReport } from "@/lib/reports";
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
}: RecentSectionProps) {
	return (
		<Card className="h-56">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-control">
					<div className="grid min-w-0 flex-1 gap-compact">
						<CardTitle>{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
					<Link
						href={href}
						className="inline-flex min-h-11 shrink-0 items-center gap-compact text-sm text-primary hover:underline"
						aria-label={`View all ${title.toLowerCase()}`}
					>
						View all <ArrowRightIcon className="size-4" />
					</Link>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="text-sm text-muted-foreground">Loading recent items…</p>
				) : isError ? (
					<p className="text-sm text-destructive">
						Could not load this list. Open the section to try again.
					</p>
				) : items.length === 0 ? (
					<div className="grid gap-control">
						<p className="text-sm text-muted-foreground">{emptyMessage}</p>
						{emptyAction && (
							<Link
								href={emptyAction.href}
								className="inline-flex min-h-11 items-center gap-compact text-sm text-primary hover:underline"
							>
								{emptyAction.label}
								<ArrowRightIcon aria-hidden="true" className="size-4" />
							</Link>
						)}
					</div>
				) : (
					<ul className="grid gap-4">
						{items.map((item) => (
							<li key={item.id}>
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
												{formatEnumLabel(item.status)}
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
											{new Intl.DateTimeFormat(undefined, {
												dateStyle: "medium",
											}).format(new Date(item.date))}
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
	onRetry,
}: {
	orders: { id: number; orderNumber: string }[];
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
}) {
	if (!isLoading && !isError && orders.length === 0) return null;

	return (
		<Card size="sm">
			<CardHeader>
				<div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-control gap-y-compact">
					<CardTitle>Orders ready for a program</CardTitle>
					{!isLoading && !isError && orders.length > 0 && (
						<Link
							href="/dashboard/orders?eligibleForProgram=true"
							className="inline-flex min-h-11 shrink-0 items-center gap-compact text-sm text-primary hover:underline"
						>
							Browse eligible orders
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</Link>
					)}
					<CardDescription className="col-span-2">
						Continue directly from an order that is eligible for planning.
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="text-sm text-muted-foreground">
						Checking eligible orders…
					</p>
				) : isError ? (
					<div className="flex flex-wrap items-center justify-between gap-control">
						<p className="text-sm text-destructive">
							Could not check which orders are ready.
						</p>
						<Button type="button" variant="outline" onClick={onRetry}>
							Try again
						</Button>
					</div>
				) : (
					<div
						className={`grid gap-control ${orders.length > 1 ? "@2xl/workspace:grid-cols-2" : "grid-cols-1"}`}
					>
						{orders.slice(0, 4).map((order) => (
							<Link
								key={order.id}
								href={`/dashboard/programs/new?orderId=${order.id}&search=${encodeURIComponent(order.orderNumber)}`}
								aria-label={`Create a program for order ${order.orderNumber}`}
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

function PendingRegistrationsSection({
	users,
}: {
	users: ReturnType<typeof getPendingClientRegistrations>;
}) {
	if (users.length === 0) return null;

	return (
		<Card size="sm">
			<CardHeader>
				<div className="flex min-w-0 flex-wrap items-start justify-between gap-control">
					<div className="grid min-w-0 gap-compact">
						<CardTitle>Registration requests</CardTitle>
						<CardDescription>
							Client accounts awaiting your review.
						</CardDescription>
					</div>
					<div className="flex shrink-0 items-center gap-control">
						<Badge variant="outline" className="tabular-nums">
							{users.length} pending
						</Badge>
						<Link
							href="/dashboard/users?registrationStatus=PENDING&role=CLIENT_REPRESENTATIVE"
							className="inline-flex min-h-11 items-center gap-compact text-sm text-primary hover:underline"
						>
							View all
							<ArrowRightIcon aria-hidden="true" className="size-4" />
						</Link>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<ul className="grid gap-control">
					{users.slice(0, 3).map((user) => (
						<li key={user.id}>
							<Link
								href={`/dashboard/users/${user.id}`}
								aria-label={`Review registration for ${user.firstName} ${user.lastName}`}
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
								<span className="shrink-0 text-muted-foreground">
									<ArrowRightIcon aria-hidden="true" className="size-4" />
								</span>
							</Link>
						</li>
					))}
				</ul>
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
			label: new Intl.DateTimeFormat(undefined, {
				month: "short",
				timeZone: "UTC",
			}).format(month),
			count: counts.get(key) ?? 0,
		};
	});
}

function OrderActivitySection() {
	const [period] = useState(getRecentOrderPeriod);
	const report = useQuery({
		queryKey: ["dashboard-order-activity", period],
		queryFn: () => getOrderReport(period),
	});
	const months = getRecentOrderMonths(period.from, report.data?.byMonth ?? []);
	const maxCount = Math.max(1, ...months.map(({ count }) => count));

	return (
		<Card size="sm">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-control">
					<div className="grid min-w-0 gap-compact">
						<CardTitle>Order activity</CardTitle>
						<CardDescription>Orders from the past six months.</CardDescription>
					</div>
					<div className="grid shrink-0 text-right">
						<span className="text-meta text-muted-foreground">
							6-month total
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
						Loading order activity…
					</div>
				) : report.isError ? (
					<div
						role="alert"
						className="flex min-h-32 flex-wrap items-center justify-between gap-control"
					>
						<p className="text-sm text-destructive">
							Could not load order activity.
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
							{report.isFetching ? "Retrying…" : "Retry"}
						</Button>
					</div>
				) : report.data.totalOrders === 0 ? (
					<div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
						No orders in this period.
					</div>
				) : (
					<div
						role="img"
						aria-label={`Monthly order counts for the past six months: ${months.map(({ label, count }) => `${label} ${count}`).join(", ")}`}
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

export function DashboardOverview() {
	const { profile, hasPermission } = useAuth();
	const quickActions = getDashboardQuickActions(hasPermission);
	const canReadOrders = hasPermission(Permission.ORDERS_READ);
	const canCreateOrders = hasPermission(Permission.ORDERS_CREATE);
	const canCreatePrograms = hasPermission(Permission.PROGRAMS_CREATE);
	const canReadPrograms = hasPermission(Permission.PROGRAMS_READ);
	const canReadClaims = hasPermission(Permission.CLAIMS_READ);
	const canCreateClaims = hasPermission(Permission.CLAIMS_CREATE);
	const canReadReports = hasPermission(Permission.REPORTS_READ);
	const canReviewUsers =
		hasPermission(Permission.USERS_READ) &&
		hasPermission(Permission.USERS_UPDATE);
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
		{ sortBy: "createdAt", sortOrder: "desc" },
		{ query: { enabled: canReadOrders } },
	);
	const readyOrdersQuery = useOrdersControllerFindEligibleForPrograms(
		{ limit: 20 },
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
	const showInsightRail = showReadyOrdersCard && canReadReports;
	const programsQuery = useProgramsControllerFindAll(
		{ sortBy: "createdAt", sortOrder: "desc" },
		{ query: { enabled: canReadPrograms } },
	);
	const claimsQuery = useClaimsControllerFindAll(
		{ sortBy: "createdAt", sortOrder: "desc" },
		{ query: { enabled: canReadClaims } },
	);
	const usersQuery = useUsersControllerFindAll({
		query: { enabled: canReviewUsers },
	});
	const pendingRegistrations = getPendingClientRegistrations(
		usersQuery.data ?? [],
		canReviewUsers,
	);

	const sections = [
		canReadOrders && (
			<RecentSection
				key="orders"
				title="Recent orders"
				description="Latest customer orders."
				href="/dashboard/orders"
				emptyMessage="No recent orders to show."
				{...(canCreateOrders && {
					emptyAction: {
						label: "Create an order",
						href: "/dashboard/orders/new",
					},
				})}
				isLoading={ordersQuery.isLoading}
				isError={ordersQuery.isError}
				items={(ordersQuery.data ?? []).slice(0, 2).map((order) => ({
					id: order.id,
					title: order.orderNumber,
					description: `${order.customer.companyName} · ${order.good.name} · ${order.quantityDemanded} ${order.unit.name}`,
					status: order.orderStatus.name,
					date: order.createdAt,
					href: `/dashboard/orders/${order.id}`,
				}))}
			/>
		),
		canReadPrograms && (
			<RecentSection
				key="programs"
				title="Recent programs"
				description="Latest forecast programs."
				href="/dashboard/programs"
				emptyMessage={
					canReadOrders && canCreatePrograms
						? "No recent forecast programs. Eligible orders appear above when they are ready."
						: "No recent forecast programs to show."
				}
				isLoading={programsQuery.isLoading}
				isError={programsQuery.isError}
				items={(programsQuery.data ?? []).slice(0, 2).map((program) => ({
					id: program.id,
					title: program.programNumber,
					description: `Order ${program.order.orderNumber} · ${program.quantityPlanned} planned`,
					status: program.programStatus.name,
					date: program.createdAt,
					href: `/dashboard/programs/${program.id}`,
				}))}
			/>
		),
		canReadClaims && (
			<RecentSection
				key="claims"
				title="Recent claims"
				description="Latest customer claims."
				href="/dashboard/claims"
				emptyMessage="No recent claims to show."
				{...(canCreateClaims && {
					emptyAction: {
						label: "Create a claim",
						href: "/dashboard/claims/new",
					},
				})}
				isLoading={claimsQuery.isLoading}
				isError={claimsQuery.isError}
				items={(claimsQuery.data ?? []).slice(0, 2).map((claim) => ({
					id: claim.id,
					title: claim.claimNumber,
					description: `${claim.customer.companyName} · ${claim.claimType.name}`,
					status: claim.claimStatus.name,
					date: claim.createdAt,
					href: `/dashboard/claims/${claim.id}`,
				}))}
			/>
		),
	].filter(Boolean);

	return (
		<section className="mx-auto grid w-full max-w-screen-2xl min-w-0 gap-6">
			<PageHeader
				title={`Welcome back, ${profile.firstName}`}
				description="A snapshot of recent activity across your workspace."
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
						{action.label}
					</Link>
				))}
			</PageHeader>

			<PendingRegistrationsSection users={pendingRegistrations} />

			{(showReadyOrdersCard || canReadReports) && (
				<section
					aria-label="Dashboard insights"
					tabIndex={showInsightRail ? 0 : undefined}
					className={`min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${showInsightRail ? "workspace-insight-rail @4xl/workspace:grid-cols-2" : "grid gap-6"}`}
				>
					{showReadyOrdersCard && (
						<ReadyOrdersSection
							orders={readyOrdersQuery.data ?? []}
							isLoading={readyOrdersQuery.isLoading}
							isError={readyOrdersQuery.isError}
							onRetry={() => void readyOrdersQuery.refetch()}
						/>
					)}
					{canReadReports && <OrderActivitySection />}
				</section>
			)}
			{showInsightRail && (
				<p className="workspace-scroll-hint text-meta text-muted-foreground">
					Swipe or use the arrow keys to view more dashboard insights.
				</p>
			)}

			{sections.length > 0 ? (
				<>
					<section
						aria-label="Recent activity"
						tabIndex={recentSectionCount > 1 ? 0 : undefined}
						className={`${recentRailClassName} ${recentGridColumns} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
					>
						{sections}
					</section>
					{recentSectionCount > 1 && (
						<p className="workspace-scroll-hint text-meta text-muted-foreground">
							Scroll horizontally to view more recent activity.
						</p>
					)}
				</>
			) : (
				<Card>
					<CardContent className="flex items-center gap-4 py-8">
						<ClipboardListIcon className="size-5 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							Your account does not have access to order, program, or claim
							lists.
						</p>
					</CardContent>
				</Card>
			)}
		</section>
	);
}
