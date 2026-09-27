import { AppHeader } from "@/components/common/app-header";
import AppSidebar from "@/components/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/providers/breadcrumb-provider";

export default async function Layout({
	children,
	modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
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

					<div className="page-enter mx-auto grid w-full min-w-0 max-w-screen-3xl grid-cols-1 gap-6 p-4 sm:p-6 print:p-0">
						{children}
					</div>
				</BreadcrumbProvider>
			</SidebarInset>
			{modal}
		</SidebarProvider>
	);
}
