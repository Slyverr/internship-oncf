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
					<Detail label="Program Number" value={program.programNumber} />
					<Detail
						label="Order Number"
						value={program.order.orderNumber ?? "—"}
					/>
					<Detail label="Status" value={program.programStatus.name} />
					<Detail label="Quantity Planned" value={program.quantityPlanned} />
					<Detail
						label="Quantity Realized"
						value={program.quantityRealized ?? "—"}
					/>
					<Detail
						label="Planned Date"
						value={formatDisplayDate(program.plannedDate)}
					/>
					<Detail
						label="Realized At"
						value={formatDisplayDate(program.realizedAt)}
					/>
					<Detail
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
					<Metric label="Wagons" value={program.orderWagons.length} />
					<Metric label="Convoys" value={program.programConvois.length} />
					<Metric
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
					<Detail label="DTM Status" value={program.dtmStatus ?? "—"} />
					<Detail
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
					<Detail
						label="Deviation Reason"
						value={program.deviationReason ?? "—"}
					/>
					<Detail
						label="Created By"
						value={`${program.createdByUser.firstName} ${program.createdByUser.lastName}`}
					/>
					<Detail
						label="Created"
						value={formatDisplayDate(program.createdAt)}
					/>
					<Detail
						label="Updated"
						value={formatDisplayDate(program.updatedAt)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

function Detail({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-start justify-between gap-4">
			<span className="text-sm text-muted-foreground">{label}</span>
			<span className="text-right text-sm font-medium">{value}</span>
		</div>
	);
}

function Metric({ label, value }: { label: string; value: number }) {
	return (
		<div className="space-y-1">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="text-2xl font-semibold">{value}</p>
		</div>
	);
}
