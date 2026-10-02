import { DashboardShell } from "@/components/common/dashboard-shell";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { BreadcrumbProvider } from "@/providers/breadcrumb-provider";

export default async function Layout({
	children,
	modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
	const t = await getRequestTranslator();
	return (
		<BreadcrumbProvider
			prefix={[{ label: t(Messages.common.dashboard), href: "/dashboard" }]}
		>
			<DashboardShell modal={modal}>{children}</DashboardShell>
		</BreadcrumbProvider>
	);
}
