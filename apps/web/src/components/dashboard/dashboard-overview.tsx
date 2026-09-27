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
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getDashboardQuickActions } from "@/lib/action-visibility";
import { useClaimsControllerFindAll } from "@/lib/api/claims";
import { useOrdersControllerFindAll } from "@/lib/api/orders";
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
	items: DashboardItem[];
	isLoading: boolean;
	isError: boolean;
}

function RecentSection({
	title,
	description,
	href,
	items,
	isLoading,
	isError,
}: RecentSectionProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="grid min-w-0 gap-compact">
						<CardTitle>{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
					<Link
						href={href}
						className="inline-flex shrink-0 items-center gap-compact text-sm text-primary hover:underline"
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
					<p className="text-sm text-muted-foreground">No records yet.</p>
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

export function DashboardOverview() {
	const { profile, hasPermission } = useAuth();
	const quickActions = getDashboardQuickActions(hasPermission);
	const canReadOrders = hasPermission(Permission.ORDERS_READ);
	const canReadPrograms = hasPermission(Permission.PROGRAMS_READ);
	const canReadClaims = hasPermission(Permission.CLAIMS_READ);
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
