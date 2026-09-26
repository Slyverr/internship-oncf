import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { OrderReportView } from "@/components/reports/order-report-view";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
	return (
		<>
			<div className="print:hidden">
				<Breadcrumbs items={[{ label: "Reports" }]} />
			</div>
			<OrderReportView />
		</>
	);
}
