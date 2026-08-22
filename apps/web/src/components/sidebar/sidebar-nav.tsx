"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { sidebarRoutes } from "./sidebar-routes";

export function SidebarNav() {
	const pathname = usePathname();

	return (
		<SidebarMenu>
			{sidebarRoutes.map((route) => {
				const isActive =
					pathname === route.url || pathname?.startsWith(`${route.url}/`);

				const Icon = route.icon;

				return (
					<SidebarMenuItem key={route.title}>
						<SidebarMenuButton
							render={<Link href={route.url} />}
							isActive={isActive}
							tooltip={route.title}
							className="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
						>
							<Icon className="size-4 shrink-0" />

							<span className="group-data-[collapsible=icon]:hidden">
								{route.title}
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				);
			})}
		</SidebarMenu>
	);
}
