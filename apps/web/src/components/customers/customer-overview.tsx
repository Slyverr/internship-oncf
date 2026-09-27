import { RecordDetail, RecordMetric } from "@/components/common/record-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";

export function CustomerOverview({
	customer,
}: {
	customer: CustomerDetailDto;
}) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Company Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<RecordDetail label="Company Name" value={customer.companyName} />
					<RecordDetail
						label="Customer Code"
						value={customer.customerCode ?? "—"}
					/>
					<RecordDetail label="ICE" value={customer.ice ?? "—"} />
					<RecordDetail label="Type ID" value={customer.typeId ?? "—"} />
					<RecordDetail
						label="Account Active"
						value={customer.isActive ? "Yes" : "No"}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Contact Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<RecordDetail label="Email" value={customer.email ?? "—"} />
					<RecordDetail label="Phone" value={customer.phone ?? "—"} />
					<RecordDetail label="Address" value={customer.address ?? "—"} />
					<RecordDetail label="City" value={customer.city ?? "—"} />
				</CardContent>
			</Card>

			<Card className="md:col-span-2">
				<CardHeader>
					<CardTitle>Metadata</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<RecordMetric
						label="Created Date"
						value={formatDisplayDate(customer.createdAt)}
					/>
					<RecordMetric
						label="Last Updated"
						value={formatDisplayDate(customer.updatedAt)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
