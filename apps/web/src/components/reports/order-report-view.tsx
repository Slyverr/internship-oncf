"use client";

import { Permission } from "@ecommand/shared";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircleIcon, PrinterIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getOrderReport, type ReportCount } from "@/lib/reports";
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
					<table className="w-full text-left">
						<thead>
							<tr className="border-b text-muted-foreground">
								<th className="pb-2 font-medium">Name</th>
								<th className="pb-2 text-right font-medium">Orders</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => (
								<tr key={row.id} className="border-b last:border-0">
									<td className="py-2 pr-3">{row.name}</td>
									<td className="py-2 text-right tabular-nums">{row.count}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
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
				className="flex flex-wrap items-end gap-3 print:hidden"
				onSubmit={(event) => {
					event.preventDefault();
					const invalid = Boolean(from && to && from > to);
					setDateError(invalid);
					if (!invalid) setPeriod({ from, to });
				}}
			>
				<label htmlFor="report-from" className="space-y-1 text-sm">
					<span>From</span>
					<Input
						id="report-from"
						type="date"
						value={from}
						onChange={(event) => setFrom(event.target.value)}
					/>
				</label>
				<label htmlFor="report-to" className="space-y-1 text-sm">
					<span>To</span>
					<Input
						id="report-to"
						type="date"
						value={to}
						onChange={(event) => setTo(event.target.value)}
					/>
				</label>
				<Button type="submit">Apply</Button>
				{dateError && (
					<p className="text-sm text-destructive" role="alert">
						From date must be before or equal to to date.
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
						Period: {report.data.from ?? "All dates"} to{" "}
						{report.data.to ?? "All dates"}
					</p>
					<Card>
						<CardHeader>
							<CardTitle>Total orders</CardTitle>
						</CardHeader>
						<CardContent className="text-3xl font-semibold tabular-nums">
							{report.data.totalOrders}
						</CardContent>
					</Card>
					<div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2">
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
