import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerDetailDto } from "@/lib/api/generated.schemas";

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
					<Detail label="Company Name" value={customer.companyName} />
					<Detail label="Customer Code" value={customer.customerCode ?? "—"} />
					<Detail label="Type ID" value={customer.typeId ?? "—"} />
					<Detail
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
					<Detail label="Email" value={customer.email ?? "—"} />
					<Detail label="Phone" value={customer.phone ?? "—"} />
					<Detail label="Address" value={customer.address ?? "—"} />
					<Detail label="City" value={customer.city ?? "—"} />
				</CardContent>
			</Card>

			<Card className="md:col-span-2">
				<CardHeader>
					<CardTitle>Metadata</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<Metric label="Created Date" value={formatDate(customer.createdAt)} />
					<Metric label="Last Updated" value={formatDate(customer.updatedAt)} />
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

function Metric({ label, value }: { label: string; value: string }) {
	return (
		<div className="space-y-1">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="text-base font-semibold">{value}</p>
		</div>
	);
}

function formatDate(date?: string | null) {
	return date ? new Date(date).toLocaleDateString() : "—";
}
