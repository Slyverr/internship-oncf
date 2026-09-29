import { RecordDetail, RecordMetric } from "@/components/common/record-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date-utils";
import { formatEnumLabel } from "@/lib/enum-labels";

export function ProgramOverview({ program }: { program: ProgramDetailDto }) {
	const history = [...program.forecastProgramHistories].sort(
		(left, right) =>
			new Date(right.changedAt).getTime() - new Date(left.changedAt).getTime(),
	);

	return (
		<div className="grid gap-4 @3xl/workspace:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Program Information</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<RecordDetail label="Program Number" value={program.programNumber} />
					<RecordDetail
						label="Order Number"
						value={program.order.orderNumber ?? "—"}
					/>
					<RecordDetail
						label="Status"
						value={formatEnumLabel(program.programStatus.name)}
					/>
					<RecordDetail
						label="Quantity Planned"
						value={program.quantityPlanned}
					/>
					<RecordDetail
						label="Quantity Realized"
						value={program.quantityRealized ?? "—"}
					/>
					<RecordDetail
						label="Planned Date"
						value={formatDisplayDate(program.plannedDate)}
					/>
					<RecordDetail
						label="Realized At"
						value={formatDisplayDate(program.realizedAt)}
					/>
					<RecordDetail
						label="Realized By"
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
					<CardTitle>Execution</CardTitle>
				</CardHeader>

				<CardContent className="grid gap-4 sm:grid-cols-2">
					<RecordMetric label="Wagons" value={program.orderWagons.length} />
					<RecordMetric label="Convoys" value={program.programConvois.length} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>DTM</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<RecordDetail label="DTM Status" value={program.dtmStatus ?? "—"} />
					<RecordDetail
						label="Sent to DTM"
						value={formatDisplayDate(program.sentToDtmAt)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Program Details</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<RecordDetail
						label="Deviation Reason"
						value={program.deviationReason ?? "—"}
					/>
					<RecordDetail
						label="Created By"
						value={`${program.createdByUser.firstName} ${program.createdByUser.lastName}`}
					/>
					<RecordDetail
						label="Created"
						value={formatDisplayDate(program.createdAt)}
					/>
					<RecordDetail
						label="Updated"
						value={formatDisplayDate(program.updatedAt)}
					/>
				</CardContent>
			</Card>

			<Card className="@3xl/workspace:col-span-2">
				<CardHeader>
					<CardTitle>Program History</CardTitle>
				</CardHeader>
				<CardContent>
					{history.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No history has been recorded yet.
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
											{historyEventTitle(event.eventType)}
										</p>
										<p className="text-xs text-muted-foreground">
											{historyEventDetails(event)}
											{event.changedByName ? ` · ${event.changedByName}` : ""}
										</p>
									</div>
									<time
										className="text-xs text-muted-foreground"
										dateTime={event.changedAt}
									>
										{formatDisplayDateTime(event.changedAt)}
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

function historyEventTitle(eventType: string) {
	const titles: Record<string, string> = {
		CREATED: "Program created",
		QUANTITY_MODIFIED: "Planned quantity changed",
		DATE_MODIFIED: "Planned date changed",
		STATUS_CHANGED: "Program status changed",
		EXECUTION_RECORDED: "Execution recorded",
		DELETED: "Program deleted",
	};
	return titles[eventType] ?? formatEnumLabel(eventType);
}

function historyEventDetails(
	event: ProgramDetailDto["forecastProgramHistories"][number],
) {
	switch (event.eventType) {
		case "QUANTITY_MODIFIED":
			return `${event.oldQuantity ?? "—"} → ${event.newQuantity ?? "—"}`;
		case "DATE_MODIFIED":
			return `${formatDisplayDate(event.oldPlannedDate)} → ${formatDisplayDate(event.newPlannedDate)}`;
		case "EXECUTION_RECORDED":
			return `${event.quantityRealized ?? "—"} realized${event.completionRate ? ` · ${event.completionRate}% complete` : ""}`;
		default:
			return "";
	}
}
