"use client";

import { Permission } from "@ecommand/shared";
import { ArrowRightIcon } from "lucide-react";
import { ActionLink } from "@/components/common/action-link";
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
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
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
	const t = useTranslate();
	const { hasPermission } = useAuth();
	const canCreatePrograms = hasPermission(Permission.PROGRAMS_CREATE);
	const { searchValue, setSearchValue, updateQuery } = useTableQueryState({
		search,
	});

	return (
		<div className="grid min-w-0 gap-4">
			<div className="flex flex-wrap items-center justify-between gap-control">
				<Input
					aria-label={t(Messages.orders.eligible.searchLabel)}
					placeholder={t(Messages.orders.eligible.searchPlaceholder)}
					value={searchValue}
					onChange={(event) => {
						setSearchValue(event.target.value);
						updateQuery("page", undefined);
					}}
					className="w-full max-w-sm"
				/>
				<p className="text-sm text-muted-foreground">
					{t(Messages.orders.eligible.showing)}
				</p>
			</div>

			<div className="min-w-0 rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t(Messages.orders.eligible.order)}</TableHead>
							<TableHead>{t(Messages.orders.eligible.quantity)}</TableHead>
							{canCreatePrograms && (
								<TableHead className="text-right">
									{t(Messages.orders.eligible.action)}
								</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.length ? (
							data.map((order) => (
								<TableRow key={order.id}>
									<TableCell className="font-medium">
										{order.orderNumber}
									</TableCell>
									<TableCell>{order.quantityDemanded}</TableCell>
									{canCreatePrograms && (
										<TableCell className="text-right">
											<ActionLink
												href={`/dashboard/programs/new?orderNumber=${order.orderNumber}&search=${encodeURIComponent(order.orderNumber ?? "")}`}
												className="justify-end gap-compact"
											>
												{t(Messages.orders.eligible.createProgram)}
												<ArrowRightIcon aria-hidden="true" className="size-4" />
											</ActionLink>
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
										? t(Messages.orders.eligible.noMatches)
										: t(Messages.orders.eligible.none)}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{(page > 1 || hasNextPage) && (
				<nav
					aria-label={t(Messages.orders.eligible.pages)}
					className="flex items-center justify-between gap-control"
				>
					{page > 1 ? (
						<ActionLink href={getPageHref(page - 1, search)}>
							{t(Messages.orders.eligible.previous)}
						</ActionLink>
					) : (
						<span />
					)}
					<span className="text-sm text-muted-foreground">
						{t(Messages.orders.eligible.page, { page })}
					</span>
					{hasNextPage && (
						<ActionLink href={getPageHref(page + 1, search)}>
							{t(Messages.orders.eligible.next)}
						</ActionLink>
					)}
				</nav>
			)}
		</div>
	);
}
