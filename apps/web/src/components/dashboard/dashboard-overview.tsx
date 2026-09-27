"use client";

import { Permission } from "@ecommand/shared";
import {
	ArrowRightIcon,
	ClipboardListIcon,
	PackageIcon,
	PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getDashboardQuickActions } from "@/lib/action-visibility";
import { useClaimsControllerFindAll } from "@/lib/api/claims";
import {
	useOrdersControllerFindAll,
	useOrdersControllerFindEligibleForPrograms,
} from "@/lib/api/orders";
import { useProgramsControllerFindAll } from "@/lib/api/programs";
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
		<Card>
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
					<ul className="divide-y">
						{items.map((item) => (
							<li key={item.id}>
								<Link
									href={item.href}
									className="grid min-w-0 gap-2 py-4 first:pt-0 last:pb-0 hover:text-primary"
								>
									<span className="flex min-w-0 items-center justify-between gap-2">
										<span className="block min-w-0 truncate font-medium">
											{item.title}
										</span>
										{item.status && (
											<Badge variant="outline" className="shrink-0 capitalize">
												{item.status.toLowerCase().replaceAll("_", " ")}
											</Badge>
										)}
									</span>
									<span className="flex min-w-0 items-center justify-between gap-2">
										<span className="block min-w-0 truncate text-sm text-muted-foreground">
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
				<div className="grid min-w-0 gap-compact">
					<CardTitle>Orders ready for a program</CardTitle>
					<CardDescription>
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
								<span className="flex shrink-0 items-center gap-compact text-muted-foreground">
									<Badge variant="outline">Eligible</Badge>
									<ArrowRightIcon aria-hidden="true" className="size-4" />
								</span>
							</Link>
						))}
					</div>
				)}
			</CardContent>
			{!isLoading && !isError && orders.length > 0 && (
				<CardFooter className="border-t">
					<Link
						href="/dashboard/programs/new"
						className="inline-flex min-h-11 items-center gap-compact text-sm text-primary hover:underline"
					>
						Browse eligible orders
						<ArrowRightIcon aria-hidden="true" className="size-4" />
					</Link>
				</CardFooter>
			)}
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
	const recentSectionCount =
		Number(canReadOrders) + Number(canReadPrograms) + Number(canReadClaims);
	const recentGridColumns =
		recentSectionCount === 3
			? "@6xl/workspace:grid-cols-3"
			: recentSectionCount === 2
				? "@5xl/workspace:grid-cols-2"
				: "grid-cols-1";

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
	const programsQuery = useProgramsControllerFindAll(
		{ sortBy: "createdAt", sortOrder: "desc" },
		{ query: { enabled: canReadPrograms } },
	);
	const claimsQuery = useClaimsControllerFindAll(
		{ sortBy: "createdAt", sortOrder: "desc" },
		{ query: { enabled: canReadClaims } },
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
				items={(ordersQuery.data ?? []).slice(0, 5).map((order) => ({
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
				items={(programsQuery.data ?? []).slice(0, 5).map((program) => ({
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
				items={(claimsQuery.data ?? []).slice(0, 5).map((claim) => ({
					id: claim.id,
					title: `Claim #${claim.id}`,
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
				description="Here is a snapshot of recent activity in ECommand."
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

			{canReadOrders && canCreatePrograms && (
				<ReadyOrdersSection
					orders={readyOrdersQuery.data ?? []}
					isLoading={readyOrdersQuery.isLoading}
					isError={readyOrdersQuery.isError}
					onRetry={() => void readyOrdersQuery.refetch()}
				/>
			)}

			{sections.length > 0 ? (
				<div className={`grid gap-4 ${recentGridColumns}`}>{sections}</div>
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

			<div className="flex items-center gap-compact text-sm text-muted-foreground">
				<PackageIcon className="size-4" />
				Showing up to five latest records for each section.
			</div>
		</section>
	);
}
