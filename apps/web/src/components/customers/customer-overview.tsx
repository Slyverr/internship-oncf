"use client";

import { RecordDetail, RecordMetric } from "@/components/common/record-summary";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import type { CustomerDetailDto } from "@/lib/api/generated.schemas";
import { getCustomerTypeLabel } from "@/lib/customer-type-label";
import { formatDisplayDate } from "@/lib/date-utils";

export function CustomerOverview({
	customer,
}: {
	customer: CustomerDetailDto;
}) {
	const t = useTranslate();
	const locale = useLocale();
	const missingSignupFields = [
		!customer.customerCode && t(Messages.customers.detail.customerCode),
		!customer.ice && t(Messages.customers.form.ice),
	].filter(Boolean);
	return (
		<div className="grid gap-4 @3xl/workspace:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>{t(Messages.customers.detail.companyDetails)}</CardTitle>
					{missingSignupFields.length > 0 && (
						<CardDescription>
							{t(Messages.customers.detail.signupVerificationNeeds, {
								fields: missingSignupFields.join(", "),
							})}
						</CardDescription>
					)}
				</CardHeader>
				<CardContent className="space-y-4">
					<RecordDetail
						label={t(Messages.customers.detail.companyName)}
						value={customer.companyName}
					/>
					<RecordDetail
						label={t(Messages.customers.detail.customerCode)}
						value={customer.customerCode ?? "—"}
					/>
					<RecordDetail
						label={t(Messages.customers.form.ice)}
						value={customer.ice ?? "—"}
					/>
					<RecordDetail
						label={t(Messages.customers.detail.typeId)}
						value={getCustomerTypeLabel(customer.customerType?.name, t) ?? "—"}
					/>
					<RecordDetail
						label={t(Messages.customers.detail.accountActive)}
						value={t(
							customer.isActive
								? Messages.customers.detail.yes
								: Messages.customers.detail.no,
						)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>
						{t(Messages.customers.detail.contactInformation)}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<RecordDetail
						label={t(Messages.customers.detail.email)}
						value={customer.email ?? "—"}
					/>
					<RecordDetail
						label={t(Messages.customers.detail.phone)}
						value={customer.phone ?? "—"}
					/>
					<RecordDetail
						label={t(Messages.customers.detail.address)}
						value={customer.address ?? "—"}
					/>
					<RecordDetail
						label={t(Messages.customers.detail.city)}
						value={customer.city ?? "—"}
					/>
				</CardContent>
			</Card>

			<Card className="@3xl/workspace:col-span-2">
				<CardHeader>
					<CardTitle>{t(Messages.customers.detail.metadata)}</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2">
					<RecordMetric
						label={t(Messages.customers.detail.createdDate)}
						value={formatDisplayDate(customer.createdAt, locale)}
					/>
					<RecordMetric
						label={t(Messages.customers.detail.lastUpdated)}
						value={formatDisplayDate(customer.updatedAt, locale)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
