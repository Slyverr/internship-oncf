import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Recent order, program, and claim activity.",
};

export default function Page() {
	return (
		<>
			<Breadcrumbs items={[]} />
			<DashboardOverview />
		</>
	);
}
