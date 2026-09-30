"use client";

import { Permission } from "@ecommand/shared";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTableQueryState } from "@/hooks/use-table-query-state";
import type { EligibleOrderForProgramDto } from "@/lib/api/generated.schemas";
import { useAuth } from "@/providers/auth-provider";

interface EligibleOrdersTableProps {
	data: EligibleOrderForProgramDto[];
	search?: string;
	page: number;
	hasNextPage: boolean;
}

function getPageHref(page: number, search?: string) {
	const params = new URLSearchParams({ eligibleForProgram: "true" });
	if (page > 1) params.set("page", String(page));
	if (search) params.set("search", search);
	return `/dashboard/orders?${params.toString()}`;
}

export function EligibleOrdersTable({
	data,
	search = "",
	page,
	hasNextPage,
}: EligibleOrdersTableProps) {
	const { hasPermission } = useAuth();
	const canCreatePrograms = hasPermission(Permission.PROGRAMS_CREATE);
	const { searchValue, setSearchValue, updateQuery } = useTableQueryState({
		search,
	});

	return (
		<div className="grid min-w-0 gap-4">
			<div className="flex flex-wrap items-center justify-between gap-control">
				<Input
					aria-label="Search eligible orders"
					placeholder="Search by order number..."
					value={searchValue}
					onChange={(event) => {
						setSearchValue(event.target.value);
						updateQuery("page", undefined);
					}}
					className="w-full max-w-sm"
				/>
				<p className="text-sm text-muted-foreground">
					Showing eligible orders only
				</p>
			</div>

			<div className="min-w-0 rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Order</TableHead>
							<TableHead>Quantity demanded</TableHead>
							{canCreatePrograms && (
								<TableHead className="text-right">Action</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.length ? (
							data.map((order) => (
								<TableRow key={order.id}>
									<TableCell className="font-medium">
										{order.orderNumber ?? `Order #${order.id}`}
									</TableCell>
									<TableCell>{order.quantityDemanded}</TableCell>
									{canCreatePrograms && (
										<TableCell className="text-right">
											<Link
												href={`/dashboard/programs/new?orderNumber=${order.orderNumber}&search=${encodeURIComponent(order.orderNumber ?? "")}`}
												className="inline-flex min-h-11 items-center justify-end gap-compact text-sm text-primary hover:underline"
											>
												Create program
												<ArrowRightIcon aria-hidden="true" className="size-4" />
											</Link>
										</TableCell>
									)}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={canCreatePrograms ? 3 : 2}
									className="py-8 text-center text-sm text-muted-foreground"
								>
									{search
										? "No eligible orders match this search."
										: "No orders are currently eligible for program planning."}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{(page > 1 || hasNextPage) && (
				<nav
					aria-label="Eligible order pages"
					className="flex items-center justify-between gap-control"
				>
					{page > 1 ? (
						<Link
							href={getPageHref(page - 1, search)}
							className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
						>
							Previous
						</Link>
					) : (
						<span />
					)}
					<span className="text-sm text-muted-foreground">Page {page}</span>
					{hasNextPage && (
						<Link
							href={getPageHref(page + 1, search)}
							className="inline-flex min-h-11 items-center text-sm text-primary hover:underline"
						>
							Next
						</Link>
					)}
				</nav>
			)}
		</div>
	);
}
