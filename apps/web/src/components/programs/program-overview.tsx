import { RecordDetail, RecordMetric } from "@/components/common/record-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProgramDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";

export function ProgramOverview({ program }: { program: ProgramDetailDto }) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
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
					<RecordDetail label="Status" value={program.programStatus.name} />
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
					<RecordMetric
						label="History Events"
						value={program.forecastProgramHistories.length}
					/>
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
		</div>
	);
}
