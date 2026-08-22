import AppSidebar from "@/components/common/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<SidebarProvider>
			<AppSidebar />

			<SidebarInset className="p-4 space-y-8">{children}</SidebarInset>
		</SidebarProvider>
	);
}
