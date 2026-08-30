import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserDetailDto } from "@/lib/api/generated.schemas";

export function UserOverview({ user }: { user: UserDetailDto }) {
	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Personal Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Detail label="First Name" value={user.firstName} />
					<Detail label="Last Name" value={user.lastName} />
					<Detail label="Email" value={user.email} />
					<Detail label="Employee ID" value={user.employeeId ?? "—"} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Role & Access</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-start justify-between gap-4">
						<span className="text-sm text-muted-foreground">Role</span>
						<Badge variant="outline" className="uppercase font-mono text-xs">
							asdhasd{user.role.name}
						</Badge>
					</div>
					<Detail label="Account Type" value={user.type ?? "—"} />
					<Detail
						label="Customer ID"
						value={user.customerId ? String(user.customerId) : "—"}
					/>
					<Detail
						label="Agency ID"
						value={user.agencyId ? String(user.agencyId) : "—"}
					/>
					<div className="flex items-start justify-between gap-4">
						<span className="text-sm text-muted-foreground">
							Account Active
						</span>
						<Badge variant={user.isActive ? "default" : "secondary"}>
							{user.isActive ? "Yes" : "No"}
						</Badge>
					</div>
				</CardContent>
			</Card>

			<Card className="md:col-span-2">
				<CardHeader>
					<CardTitle>Activity Timestamps</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-3">
					<Metric label="Last Login" value={formatDate(user.lastLogin)} />
					<Metric label="Created Date" value={formatDate(user.createdAt)} />
					<Metric label="Last Updated" value={formatDate(user.updatedAt)} />
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
	return date ? new Date(date).toLocaleString() : "—";
}
