import { RegistrationStatus } from "@ecommand/shared";
import { RecordDetail, RecordMetric } from "@/components/common/record-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDateTime } from "@/lib/date-utils";

export function UserOverview({ user }: { user: UserDetailDto }) {
	return (
		<div className="grid gap-4 @3xl/workspace:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Personal Information</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<RecordDetail label="First Name" value={user.firstName} />
					<RecordDetail label="Last Name" value={user.lastName} />
					<RecordDetail label="Email" value={user.email} />
					<RecordDetail label="Employee ID" value={user.employeeId ?? "—"} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Role & Access</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid min-w-0 gap-2 sm:grid-cols-2 sm:items-baseline">
						<span className="text-sm text-muted-foreground">Role</span>
						<Badge variant="outline" className="uppercase font-mono text-xs">
							{user.role.name}
						</Badge>
					</div>
					<RecordDetail label="Account Type" value={user.type ?? "—"} />
					<RecordDetail
						label="Customer ID"
						value={user.customerId ? String(user.customerId) : "—"}
					/>
					<RecordDetail
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
					<div className="flex items-start justify-between gap-4">
						<span className="text-sm text-muted-foreground">
							Registration Status
						</span>
						<Badge
							variant={
								user.registrationStatus === RegistrationStatus.PENDING
									? "outline"
									: user.registrationStatus === RegistrationStatus.REJECTED
										? "secondary"
										: "default"
							}
						>
							{user.registrationStatus === RegistrationStatus.PENDING
								? "Awaiting review"
								: user.registrationStatus === RegistrationStatus.REJECTED
									? "Rejected"
									: "Approved"}
						</Badge>
					</div>
					{user.registrationStatus === RegistrationStatus.PENDING && (
						<p className="text-sm text-muted-foreground">
							The customer code and ICE matched an active customer record. This
							account stays inactive until an administrator approves it.
						</p>
					)}
				</CardContent>
			</Card>

			<Card className="@3xl/workspace:col-span-2">
				<CardHeader>
					<CardTitle>Activity Timestamps</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-3">
					<RecordMetric
						label="Last Login"
						value={formatDisplayDateTime(user.lastLogin)}
					/>
					<RecordMetric
						label="Created Date"
						value={formatDisplayDateTime(user.createdAt)}
					/>
					<RecordMetric
						label="Last Updated"
						value={formatDisplayDateTime(user.updatedAt)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
