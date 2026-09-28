import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export function DashboardHome() {
	return (
		<>
			<Breadcrumbs items={[]} />
			<DashboardOverview />
		</>
	);
}
