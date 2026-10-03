"use client";

import { Permission } from "@ecommand/shared";
import { useQuery } from "@tanstack/react-query";
import {
	Building2Icon,
	CalendarDaysIcon,
	ClipboardListIcon,
	DownloadIcon,
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
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { getOrderStatusLabel } from "@/i18n/status-labels";
import { formatDisplayDate, formatMonthYear } from "@/lib/date-utils";
import { formatNumber } from "@/lib/number-utils";
import {
	getOrderReport,
	hasInvalidOrderReportDateRange,
	orderReportToCsv,
	type ReportCount,
} from "@/lib/reports";
import { useAuth } from "@/providers/auth-provider";

function Breakdown({
	title,
	rows,
	totalOrders,
	formatName = (name) => name,
}: {
	title: string;
	rows: ReportCount[];
	totalOrders: number;
	formatName?: (name: string) => string;
}) {
	const t = useTranslate();
	const locale = useLocale();
	const maximum = Math.max(totalOrders, 1);
	const accessibleLabel = t(Messages.reports.orderCountsLabel, {
		title,
	});

	return (
		<Card
			role="group"
			aria-label={accessibleLabel}
			className="report-print-breakdown"
		>
			<CardHeader className="pb-0">
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{rows.length === 0 ? (
					<p className="text-muted-foreground">
						{t(Messages.reports.noOrdersInPeriod)}
					</p>
				) : (
					<ul aria-label={accessibleLabel} className="grid gap-4">
						{rows.map((row) => {
							const name = formatName(row.name);
							const percentage = Math.min((row.count / maximum) * 100, 100);
							return (
								<li
									key={row.id}
									className="report-print-row grid min-w-0 gap-2"
								>
									<div className="flex min-w-0 items-center justify-between gap-4 text-sm">
										<span
											className="report-print-name min-w-0 truncate"
											title={name}
										>
											{name}
										</span>
										<span className="shrink-0 font-medium tabular-nums">
											{formatNumber(row.count, locale)}
										</span>
									</div>
									<div
										role="progressbar"
										aria-label={name}
										aria-valuemin={0}
										aria-valuemax={maximum}
										aria-valuenow={row.count}
										className="h-2 overflow-hidden rounded-full bg-muted"
									>
										<span
											aria-hidden="true"
											className="block h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-300"
											style={{ width: `${percentage}%` }}
										/>
									</div>
								</li>
							);
						})}
					</ul>
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
	const locale = useLocale();
	return (
		<Card
			size="sm"
			role="group"
			className="report-print-metric"
			aria-label={`${label}: ${formatNumber(value, locale)}`}
		>
			<CardContent className="flex min-h-16 flex-row items-center justify-between gap-control">
				<div className="grid min-w-0 gap-compact">
					<span className="text-sm font-medium text-muted-foreground">
						{label}
					</span>
					<span className="text-3xl font-semibold tabular-nums">
						{formatNumber(value, locale)}
					</span>
				</div>
				<span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-primary">
					<Icon aria-hidden="true" className="size-4" />
				</span>
			</CardContent>
		</Card>
	);
}

export function OrderReportView() {
	const t = useTranslate();
	const locale = useLocale();
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
	const exportCsv = () => {
		if (!report.data) return;
		const labels = {
			section: t(Messages.reports.exportSection),
			name: t(Messages.reports.name),
			orders: t(Messages.reports.orders),
			byStatus: t(Messages.reports.byStatus),
			byCustomer: t(Messages.reports.byCustomer),
			byProduct: t(Messages.reports.byProduct),
			byMonth: t(Messages.reports.byMonth),
		};
		const csv = orderReportToCsv(
			{
				...report.data,
				byStatus: report.data.byStatus.map((row) => ({
					...row,
					name: getOrderStatusLabel(row.name, locale),
				})),
				byMonth: report.data.byMonth.map((row) => ({
					...row,
					month: formatMonthYear(row.month, locale),
				})),
			},
			labels,
		);
		const url = window.URL.createObjectURL(
			new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
		);
		const link = document.createElement("a");
		link.href = url;
		link.download = `ecommand-order-report${period.from ? `-${period.from}` : ""}${period.to ? `-to-${period.to}` : ""}.csv`;
		link.click();
		window.URL.revokeObjectURL(url);
	};

	if (!canRead) return <p>{t(Messages.reports.noAccess)}</p>;

	return (
		<section data-report-print-root className="space-y-6 print:space-y-4">
			<PageHeader
				title={t(Messages.reports.title)}
				description={t(Messages.reports.description)}
			>
				{canExport && (
					<Button
						className="print:hidden"
						variant="outline"
						disabled={!report.data}
						onClick={exportCsv}
					>
						<DownloadIcon /> {t(Messages.reports.exportCsv)}
					</Button>
				)}
				{canExport && (
					<Button
						className="print:hidden"
						variant="outline"
						disabled={!report.data}
						onClick={() => window.print()}
					>
						<PrinterIcon /> {t(Messages.reports.print)}
					</Button>
				)}
			</PageHeader>
			<form
				className="grid w-full min-w-0 grid-cols-1 items-end gap-3 print:hidden @md/workspace:w-fit @md/workspace:grid-cols-[minmax(0,12rem)_minmax(0,12rem)_max-content]"
				onSubmit={(event) => {
					event.preventDefault();
					const invalid = hasInvalidOrderReportDateRange(from, to);
					setDateError(invalid);
					if (!invalid) setPeriod({ from, to });
				}}
			>
				<label htmlFor="report-from" className="oncf-field min-w-0 text-sm">
					<span className="font-medium">{t(Messages.reports.from)}</span>
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
					<span className="font-medium">{t(Messages.reports.to)}</span>
					<Input
						id="report-to"
						type="date"
						aria-invalid={dateError}
						aria-describedby={dateError ? "report-date-range-error" : undefined}
						value={to}
						onChange={(event) => setTo(event.target.value)}
					/>
				</label>
				<Button type="submit" className="w-fit">
					{t(Messages.reports.apply)}
				</Button>
			</form>
			{dateError && (
				<p
					id="report-date-range-error"
					className="mt-3 w-fit max-w-sm text-sm text-destructive print:hidden"
					role="alert"
				>
					{t(Messages.reports.dateRangeInvalid)}
				</p>
			)}
			{report.isPending ? (
				<div
					role="status"
					className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-4"
				>
					<LoaderCircleIcon
						aria-hidden="true"
						className="size-4 animate-spin motion-reduce:animate-none"
					/>
					<p>{t(Messages.reports.loading)}</p>
				</div>
			) : report.isError ? (
				<div
					role="alert"
					aria-busy={report.isFetching}
					className="flex min-h-16 flex-col items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center"
				>
					<p className="text-sm text-destructive">
						{t(Messages.reports.loadFailed)}
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
								? Messages.reports.retrying
								: Messages.reports.retry,
						)}
					</Button>
				</div>
			) : (
				<>
					<p className="text-sm text-muted-foreground">
						{t(Messages.reports.period, {
							value:
								report.data.from && report.data.to
									? t(Messages.reports.periodRange, {
											from: formatDisplayDate(report.data.from, locale),
											to: formatDisplayDate(report.data.to, locale),
										})
									: report.data.from
										? t(Messages.reports.periodFrom, {
												date: formatDisplayDate(report.data.from, locale),
											})
										: report.data.to
											? t(Messages.reports.periodThrough, {
													date: formatDisplayDate(report.data.to, locale),
												})
											: t(Messages.reports.allDates),
						})}
					</p>
					<div className="grid grid-cols-2 gap-4 print:grid-cols-4 print:gap-3 @5xl/workspace:grid-cols-4">
						<ReportMetric
							label={t(Messages.reports.totalOrders)}
							value={report.data.totalOrders}
							icon={ClipboardListIcon}
						/>
						<ReportMetric
							label={t(Messages.reports.customers)}
							value={report.data.byCustomer.length}
							icon={Building2Icon}
						/>
						<ReportMetric
							label={t(Messages.reports.products)}
							value={report.data.byProduct.length}
							icon={PackageIcon}
						/>
						<ReportMetric
							label={t(Messages.reports.activeMonths)}
							value={report.data.byMonth.length}
							icon={CalendarDaysIcon}
						/>
					</div>
					<div className="grid gap-4 print:grid-cols-2 print:gap-3 @3xl/workspace:grid-cols-2">
						<Breakdown
							title={t(Messages.reports.byStatus)}
							rows={report.data.byStatus}
							totalOrders={report.data.totalOrders}
							formatName={(name) => getOrderStatusLabel(name, locale)}
						/>
						<Breakdown
							title={t(Messages.reports.byCustomer)}
							rows={report.data.byCustomer}
							totalOrders={report.data.totalOrders}
						/>
						<Breakdown
							title={t(Messages.reports.byProduct)}
							rows={report.data.byProduct}
							totalOrders={report.data.totalOrders}
						/>
						<Breakdown
							title={t(Messages.reports.byMonth)}
							rows={report.data.byMonth.map((row) => ({
								id: row.month,
								name: formatMonthYear(row.month, locale),
								count: row.count,
							}))}
							totalOrders={report.data.totalOrders}
						/>
					</div>
				</>
			)}
		</section>
	);
}
