"use client";

import { Permission } from "@ecommand/shared";
import { useQuery } from "@tanstack/react-query";
import {
	Building2Icon,
	CalendarDaysIcon,
	ClipboardListIcon,
	LoaderCircleIcon,
	PackageIcon,
	PrinterIcon,
	RefreshCwIcon,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	getOrderReport,
	hasInvalidOrderReportDateRange,
	type ReportCount,
} from "@/lib/reports";
import { useAuth } from "@/providers/auth-provider";

function Breakdown({ title, rows }: { title: string; rows: ReportCount[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{rows.length === 0 ? (
					<p className="text-muted-foreground">No orders in this period.</p>
				) : (
					<Table aria-label={`${title} order counts`}>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead className="text-right">Orders</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((row) => (
								<TableRow key={row.id}>
									<TableCell>{row.name}</TableCell>
									<TableCell className="text-right tabular-nums">
										{row.count}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}

function ReportMetric({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: number;
	icon: typeof ClipboardListIcon;
}) {
	return (
		<Card size="sm" role="group" aria-label={`${label}: ${value}`}>
			<CardContent className="flex min-h-16 flex-row items-center justify-between gap-control">
				<div className="grid min-w-0 gap-compact">
					<span className="text-sm font-medium text-muted-foreground">
						{label}
					</span>
					<span className="text-3xl font-semibold tabular-nums">{value}</span>
				</div>
				<span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-primary">
					<Icon aria-hidden="true" className="size-4" />
				</span>
			</CardContent>
		</Card>
	);
}

export function OrderReportView() {
	const { hasPermission } = useAuth();
	const canRead = hasPermission(Permission.REPORTS_READ);
	const canExport = hasPermission(Permission.REPORTS_ACTION_EXPORT);
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [period, setPeriod] = useState({ from: "", to: "" });
	const [dateError, setDateError] = useState(false);
	const report = useQuery({
		queryKey: ["order-report", period],
		queryFn: () =>
			getOrderReport({
				from: period.from || undefined,
				to: period.to || undefined,
			}),
		enabled: canRead,
	});

	if (!canRead) return <p>You do not have access to reports.</p>;

	return (
		<section className="space-y-6 print:space-y-4">
			<PageHeader
				title="Order reports"
				description="Order counts by status, customer, product, and month."
			>
				{canExport && (
					<Button
						className="print:hidden"
						variant="outline"
						disabled={!report.data}
						onClick={() => window.print()}
					>
						<PrinterIcon /> Print / save PDF
					</Button>
				)}
			</PageHeader>
			<form
				className="grid w-full max-w-3xl grid-cols-1 items-end gap-4 print:hidden @sm/workspace:grid-cols-2 @2xl/workspace:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
				onSubmit={(event) => {
					event.preventDefault();
					const invalid = hasInvalidOrderReportDateRange(from, to);
					setDateError(invalid);
					if (!invalid) setPeriod({ from, to });
				}}
			>
				<label htmlFor="report-from" className="oncf-field min-w-0 text-sm">
					<span className="font-medium">From</span>
					<Input
						id="report-from"
						type="date"
						aria-invalid={dateError}
						aria-describedby={dateError ? "report-date-range-error" : undefined}
						value={from}
						onChange={(event) => setFrom(event.target.value)}
					/>
				</label>
				<label htmlFor="report-to" className="oncf-field min-w-0 text-sm">
					<span className="font-medium">To</span>
					<Input
						id="report-to"
						type="date"
						aria-invalid={dateError}
						aria-describedby={dateError ? "report-date-range-error" : undefined}
						value={to}
						onChange={(event) => setTo(event.target.value)}
					/>
				</label>
				<Button
					type="submit"
					className="w-full @sm/workspace:col-span-2 @2xl/workspace:col-span-1 @2xl/workspace:w-auto"
				>
					Apply
				</Button>
				{dateError && (
					<p
						id="report-date-range-error"
						className="text-sm text-destructive @sm/workspace:col-span-2 @2xl/workspace:col-span-3"
						role="alert"
					>
						The start date must be on or before the end date.
					</p>
				)}
			</form>
			{report.isPending ? (
				<div
					role="status"
					className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-4"
				>
					<LoaderCircleIcon
						aria-hidden="true"
						className="size-4 animate-spin motion-reduce:animate-none"
					/>
					<p>Loading report…</p>
				</div>
			) : report.isError ? (
				<div
					role="alert"
					aria-busy={report.isFetching}
					className="flex min-h-16 flex-col items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center"
				>
					<p className="text-sm text-destructive">
						Could not load the report. Check your connection and retry.
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
						{report.isFetching ? "Retrying…" : "Retry report"}
					</Button>
				</div>
			) : (
				<>
					<p className="text-sm text-muted-foreground">
						Period:{" "}
						{report.data.from && report.data.to
							? `${report.data.from} to ${report.data.to}`
							: report.data.from
								? `From ${report.data.from}`
								: report.data.to
									? `Through ${report.data.to}`
									: "All dates"}
					</p>
					<div className="grid grid-cols-2 gap-4 @5xl/workspace:grid-cols-4">
						<ReportMetric
							label="Total orders"
							value={report.data.totalOrders}
							icon={ClipboardListIcon}
						/>
						<ReportMetric
							label="Customers"
							value={report.data.byCustomer.length}
							icon={Building2Icon}
						/>
						<ReportMetric
							label="Products"
							value={report.data.byProduct.length}
							icon={PackageIcon}
						/>
						<ReportMetric
							label="Active months"
							value={report.data.byMonth.length}
							icon={CalendarDaysIcon}
						/>
					</div>
					<div className="grid gap-4 @3xl/workspace:grid-cols-2 print:grid-cols-2">
						<Breakdown title="By status" rows={report.data.byStatus} />
						<Breakdown title="By customer" rows={report.data.byCustomer} />
						<Breakdown title="By product" rows={report.data.byProduct} />
						<Breakdown
							title="By month"
							rows={report.data.byMonth.map((row) => ({
								id: row.month,
								name: row.month,
								count: row.count,
							}))}
						/>
					</div>
				</>
			)}
		</section>
	);
}
