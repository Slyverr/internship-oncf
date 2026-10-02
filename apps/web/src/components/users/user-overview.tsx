"use client";

import { RegistrationStatus } from "@ecommand/shared";
import { RecordDetail, RecordMetric } from "@/components/common/record-summary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import type { UserDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDateTime } from "@/lib/date-utils";
import {
	formatRegistrationStatus,
	formatUserRole,
	formatUserType,
} from "@/lib/user-labels";

export function UserOverview({ user }: { user: UserDetailDto }) {
	const t = useTranslate();
	const locale = useLocale();
	const emailAt = user.email.lastIndexOf("@");
	const emailValue =
		emailAt > 0 ? (
			<>
				{user.email.slice(0, emailAt)}
				<wbr />
				{user.email.slice(emailAt)}
			</>
		) : (
			user.email
		);
	return (
		<div className="grid gap-4 @3xl/workspace:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>{t(Messages.users.detail.personalInformation)}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<RecordDetail
						label={t(Messages.users.detail.firstName)}
						value={user.firstName}
					/>
					<RecordDetail
						label={t(Messages.users.detail.lastName)}
						value={user.lastName}
					/>
					<RecordDetail
						label={t(Messages.users.detail.email)}
						value={emailValue}
						wideValue
					/>
					<RecordDetail
						label={t(Messages.users.detail.employeeCode)}
						value={user.employeeCode ?? "—"}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t(Messages.users.detail.roleAccess)}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<RecordDetail
						label={t(Messages.users.form.fields.role)}
						value={
							<span className="flex w-full justify-end">
								<Badge
									variant="outline"
									className="max-w-full text-right text-xs"
								>
									{formatUserRole(user.role.name, locale)}
								</Badge>
							</span>
						}
					/>
					<RecordDetail
						label={t(Messages.users.detail.accountType)}
						value={formatUserType(user.type, locale)}
					/>
					<RecordDetail
						label={t(Messages.users.detail.customerId)}
						value={user.customerId ? String(user.customerId) : "—"}
					/>
					<RecordDetail
						label={t(Messages.users.detail.agencyId)}
						value={user.agencyId ? String(user.agencyId) : "—"}
					/>
					<RecordDetail
						label={t(Messages.users.detail.accountActive)}
						value={
							<Badge variant={user.isActive ? "default" : "secondary"}>
								{user.isActive
									? t(Messages.users.detail.yes)
									: t(Messages.users.detail.no)}
							</Badge>
						}
					/>
					<RecordDetail
						label={t(Messages.users.detail.registrationStatus)}
						value={
							<Badge
								variant={
									user.registrationStatus === RegistrationStatus.PENDING
										? "outline"
										: user.registrationStatus === RegistrationStatus.REJECTED
											? "secondary"
											: "default"
								}
							>
								{formatRegistrationStatus(user.registrationStatus, locale)}
							</Badge>
						}
					/>
					{user.registrationStatus === RegistrationStatus.PENDING && (
						<p className="text-sm text-muted-foreground">
							{t(Messages.users.detail.pendingExplanation)}
						</p>
					)}
				</CardContent>
			</Card>

			<Card className="@3xl/workspace:col-span-2">
				<CardHeader>
					<CardTitle>{t(Messages.users.detail.activityTimestamps)}</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-3">
					<RecordMetric
						label={t(Messages.users.detail.lastLogin)}
						value={formatDisplayDateTime(user.lastLogin, locale)}
					/>
					<RecordMetric
						label={t(Messages.users.detail.createdDate)}
						value={formatDisplayDateTime(user.createdAt, locale)}
					/>
					<RecordMetric
						label={t(Messages.users.detail.lastUpdated)}
						value={formatDisplayDateTime(user.updatedAt, locale)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
