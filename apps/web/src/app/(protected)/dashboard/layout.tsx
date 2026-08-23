import { AppHeader } from "@/components/common/app-header";
import AppSidebar from "@/components/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbProvider } from "@/providers/breadcrumb-provider";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<SidebarProvider>
			<AppSidebar />

			<SidebarInset>
				<BreadcrumbProvider
					prefix={[{ label: "Dashboard", href: "/dashboard" }]}
				>
					<AppHeader />

					<div className="space-y-8 p-4">{children}</div>
				</BreadcrumbProvider>
			</SidebarInset>
		</SidebarProvider>
	);
}
