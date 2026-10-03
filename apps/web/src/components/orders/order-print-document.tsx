import type { ReactNode } from "react";
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { getOrderStatusLabel } from "@/i18n/status-labels";
import type { OrderDetailDto } from "@/lib/api/generated.schemas";
import { formatDisplayDate } from "@/lib/date-utils";

function PrintField({ label, value }: { label: string; value: ReactNode }) {
	return (
		<div className="order-print-field">
			<dt>{label}</dt>
			<dd>{value ?? "—"}</dd>
		</div>
	);
}

export function OrderPrintDocument({ order }: { order: OrderDetailDto }) {
	const t = useTranslate();
	const locale = useLocale();
	const fields = Messages.common.fields;
	const information: [string, ReactNode][] = [
		[t(Messages.orders.detail.customer), order.customer.companyName],
		[
			t(Messages.orders.detail.status),
			getOrderStatusLabel(order.orderStatus.name, locale),
		],
		[t(fields.supervisor), order.supervisor],
		[
			t(fields.quantityDemanded),
			`${order.quantityDemanded} ${order.unit.name}`,
		],
		[
			t(fields.quantityAchieved),
			order.quantityAchieved
				? `${order.quantityAchieved} ${order.unit.name}`
				: null,
		],
		[t(fields.orderDate), formatDisplayDate(order.orderDate, locale)],
		[
			t(Messages.orders.detail.created),
			formatDisplayDate(order.createdAt, locale),
		],
		[
			t(Messages.orders.detail.updated),
			formatDisplayDate(order.updatedAt, locale),
		],
	];
	const transport: [string, ReactNode][] = [
		[t(fields.goodsId), order.good.name],
		[t(fields.departureStationId), order.departureStationId],
		[t(fields.arrivalStationId), order.arrivalStationId],
		[t(fields.debtorCustomerId), order.debtorCustomerId],
		[t(fields.destinationCustomerId), order.destinationCustomerId],
		[t(fields.movementTypeId), order.movementTypeId],
		[t(fields.pickupLocationTypeId), order.pickupLocationTypeId],
		[t(fields.dispatchTypeId), order.dispatchTypeId],
		[t(fields.deliveryLocationTypeId), order.deliveryLocationTypeId],
		[t(fields.pickupPortId), order.pickupPortId],
		[t(fields.pickupBerthId), order.pickupBerthId],
		[t(fields.pickupSidingId), order.pickupSidingId],
		[t(fields.deliveryPortId), order.deliveryPortId],
		[t(fields.deliveryBerthId), order.deliveryBerthId],
		[t(fields.deliverySidingId), order.deliverySidingId],
	];
	const schedule: [string, ReactNode][] = [
		[t(fields.startDate), formatDisplayDate(order.startDate, locale)],
		[t(fields.endDate), formatDisplayDate(order.endDate, locale)],
	];

	return (
		<article
			id="order-print-document"
			data-order-print-root
			aria-label={`${t(Messages.orders.detail.printTitle)} ${order.orderNumber}`}
			className="hidden print:block"
		>
			<header className="order-print-header">
				<p className="order-print-brand">
					{t(Messages.common.brand.oncfName)} · {t(Messages.auth.brand.name)}
				</p>
				<h1>
					{t(Messages.orders.detail.printTitle)} {order.orderNumber}
				</h1>
				<p>{t(Messages.orders.detail.printDescription)}</p>
			</header>

			<PrintSection
				title={t(Messages.orders.detail.information)}
				fields={information}
			/>
			<PrintSection
				title={t(Messages.orders.detail.transport)}
				fields={transport}
			/>
			<PrintSection title={t(Messages.orders.detail.dates)} fields={schedule} />
			<PrintSection
				title={t(Messages.orders.detail.remarks)}
				fields={[[t(fields.remarks), order.remarks]]}
			/>

			{order.orderFiles.length > 0 && (
				<PrintSection
					title={t(Messages.orders.detail.relatedFiles)}
					fields={order.orderFiles.map((file): [string, ReactNode] => [
						file.fileName,
						file.description,
					])}
				/>
			)}
		</article>
	);
}

function PrintSection({
	title,
	fields,
}: {
	title: string;
	fields: [string, ReactNode][];
}) {
	return (
		<section className="order-print-section">
			<h2>{title}</h2>
			<dl>
				{fields.map(([label, value]) => (
					<PrintField key={label} label={label} value={value} />
				))}
			</dl>
		</section>
	);
}
