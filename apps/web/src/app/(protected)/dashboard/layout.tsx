import { AppHeader } from "@/components/common/app-header";
import AppSidebar from "@/components/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/providers/breadcrumb-provider";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<SidebarProvider>
			<AppSidebar className="print:hidden" />

			<SidebarInset>
				<BreadcrumbProvider
					prefix={[{ label: "Dashboard", href: "/dashboard" }]}
				>
					<div className="print:hidden">
						<AppHeader />
					</div>

					<div className="page-enter space-y-8 p-4 print:p-0">{children}</div>
				</BreadcrumbProvider>
			</SidebarInset>
		</SidebarProvider>
	);
}
