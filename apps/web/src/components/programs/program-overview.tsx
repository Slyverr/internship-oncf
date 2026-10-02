import { RecordDetail, RecordMetric } from "@/components/common/record-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type AppLocale, type MessageKey, Messages, translate } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { getProgramStatusLabel } from "@/i18n/status-labels";
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date-utils";

export function ProgramOverview({ program }: { program: ProgramDetailDto }) {
	const locale = useLocale();
	const t = useTranslate();
	const history = [...program.forecastProgramHistories].sort(
		(left, right) =>
			new Date(right.changedAt).getTime() - new Date(left.changedAt).getTime(),
	);

	return (
		<div className="grid gap-4 @3xl/workspace:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>{t(Messages.programs.detail.information)}</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<RecordDetail
						label={t(Messages.programs.detail.programNumber)}
						value={program.programNumber}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.orderNumber)}
						value={program.order.orderNumber ?? "—"}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.status)}
						value={getProgramStatusLabel(program.programStatus.name, locale)}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.quantityPlanned)}
						value={program.quantityPlanned}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.quantityRealized)}
						value={program.quantityRealized ?? "—"}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.plannedDate)}
						value={formatDisplayDate(program.plannedDate, locale)}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.realizedAt)}
						value={formatDisplayDate(program.realizedAt, locale)}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.realizedBy)}
						value={
							program.realizedByUser
								? `${program.realizedByUser.firstName} ${program.realizedByUser.lastName}`
								: "—"
						}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t(Messages.programs.detail.execution)}</CardTitle>
				</CardHeader>

				<CardContent className="grid gap-4 sm:grid-cols-2">
					<RecordMetric
						label={t(Messages.programs.detail.wagons)}
						value={program.orderWagons.length}
					/>
					<RecordMetric
						label={t(Messages.programs.detail.convoys)}
						value={program.programConvois.length}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t(Messages.programs.detail.dtm)}</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<RecordDetail
						label={t(Messages.programs.detail.dtmStatus)}
						value={program.dtmStatus ?? "—"}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.sentToDtm)}
						value={formatDisplayDate(program.sentToDtmAt, locale)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t(Messages.programs.detail.programDetails)}</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<RecordDetail
						label={t(Messages.programs.detail.deviationReason)}
						value={program.deviationReason ?? "—"}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.createdBy)}
						value={`${program.createdByUser.firstName} ${program.createdByUser.lastName}`}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.created)}
						value={formatDisplayDate(program.createdAt, locale)}
					/>
					<RecordDetail
						label={t(Messages.programs.detail.updated)}
						value={formatDisplayDate(program.updatedAt, locale)}
					/>
				</CardContent>
			</Card>

			<Card className="@3xl/workspace:col-span-2">
				<CardHeader>
					<CardTitle>{t(Messages.programs.detail.history)}</CardTitle>
				</CardHeader>
				<CardContent>
					{history.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							{t(Messages.programs.detail.noHistory)}
						</p>
					) : (
						<ol className="divide-y divide-border">
							{history.map((event) => (
								<li
									className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center"
									key={event.id}
								>
									<div className="min-w-0">
										<p className="text-sm font-medium">
											{historyEventTitle(event.eventType, locale)}
										</p>
										<p className="text-xs text-muted-foreground">
											{historyEventDetails(event, locale)}
											{event.changedByName ? ` · ${event.changedByName}` : ""}
										</p>
									</div>
									<time
										className="text-xs text-muted-foreground"
										dateTime={event.changedAt}
									>
										{formatDisplayDateTime(event.changedAt, locale)}
									</time>
								</li>
							))}
						</ol>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function historyEventTitle(eventType: string, locale: AppLocale) {
	const keys: Record<string, MessageKey> = {
		CREATED: Messages.programs.detail.historyEvents.created,
		QUANTITY_MODIFIED: Messages.programs.detail.historyEvents.quantityModified,
		DATE_MODIFIED: Messages.programs.detail.historyEvents.dateModified,
		STATUS_CHANGED: Messages.programs.detail.historyEvents.statusChanged,
		EXECUTION_RECORDED:
			Messages.programs.detail.historyEvents.executionRecorded,
		DELETED: Messages.programs.detail.historyEvents.deleted,
	};
	return translate(
		keys[eventType] ?? Messages.programs.detail.historyEvents.unknown,
		{},
		locale,
	);
}

function historyEventDetails(
	event: ProgramDetailDto["forecastProgramHistories"][number],
	locale: AppLocale,
) {
	switch (event.eventType) {
		case "QUANTITY_MODIFIED":
			return `${event.oldQuantity ?? "—"} → ${event.newQuantity ?? "—"}`;
		case "DATE_MODIFIED":
			return `${formatDisplayDate(event.oldPlannedDate, locale)} → ${formatDisplayDate(event.newPlannedDate, locale)}`;
		case "EXECUTION_RECORDED":
			return event.completionRate
				? translate(
						Messages.programs.detail.historyEvents.completion,
						{
							quantity: event.quantityRealized ?? "—",
							rate: event.completionRate,
						},
						locale,
					)
				: translate(
						Messages.programs.detail.historyEvents.quantityRealized,
						{
							quantity: event.quantityRealized ?? "—",
						},
						locale,
					);
		default:
			return "";
	}
}
