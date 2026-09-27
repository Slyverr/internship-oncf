"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";
import { sidebarRoutes } from "./sidebar-routes";

export function SidebarNav() {
	const pathname = usePathname();
	const { hasPermission } = useAuth();
	const visibleRoutes = sidebarRoutes.filter(
		(route) => !route.permission || hasPermission(route.permission),
	);

	return (
		<SidebarMenu className="py-4">
			{visibleRoutes.map((route) => {
				const isActive = route.exact
					? pathname === route.url
					: pathname === route.url || pathname?.startsWith(`${route.url}/`);

				const Icon = route.icon;
				const textColor = isActive
					? "text-sidebar-primary"
					: "group-hover/button:text-sidebar-primary";

				return (
					<SidebarMenuItem key={route.title}>
						<SidebarMenuButton
							render={<Link href={route.url} />}
							isActive={isActive}
							tooltip={route.title}
							className={`group/button relative w-full px-4 py-2 rounded-none transition-colors ${
								isActive
									? "bg-sidebar-primary/10 font-semibold dark:bg-sidebar-primary/20"
									: "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:hover:text-sidebar-primary"
							} group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:rounded-md`}
						>
							{isActive && (
								<span className="absolute left-0 inset-y-0 w-1 rounded-r-sm bg-sidebar-primary transition-all duration-200 group-data-[collapsible=icon]:hidden" />
							)}

							<Icon
								className={`size-4 shrink-0 transition-colors ${textColor}`}
							/>

							<span
								className={`min-w-0 max-w-48 overflow-hidden whitespace-nowrap transition-[max-width,opacity,color] duration-200 ease-linear motion-reduce:transition-none group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 ${textColor}`}
							>
								{route.title}
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				);
			})}
		</SidebarMenu>
	);
}
