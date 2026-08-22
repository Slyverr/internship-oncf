"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarLogo } from "./sidebar-logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";

export default function AppSidebar(
	props: React.ComponentProps<typeof Sidebar>,
) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarLogo />
			</SidebarHeader>

			<SidebarContent>
				<SidebarNav />
			</SidebarContent>

			<SidebarFooter>
				<SidebarUser />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
