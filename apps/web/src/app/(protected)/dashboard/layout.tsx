import { DashboardShell } from "@/components/common/dashboard-shell";
import { BreadcrumbProvider } from "@/providers/breadcrumb-provider";

export default async function Layout({
	children,
	modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
	return (
		<BreadcrumbProvider prefix={[{ label: "Dashboard", href: "/dashboard" }]}>
			<DashboardShell modal={modal}>{children}</DashboardShell>
		</BreadcrumbProvider>
	);
}
