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
		<SidebarMenu className="py-4">
			{sidebarRoutes.map((route) => {
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
							className={`group/button relative w-full py-6 px-4 rounded-none transition-colors ${
								isActive
									? "bg-sidebar-primary/10 font-semibold dark:bg-sidebar-primary/20"
									: "text-sidebar-foreground/70 hover:bg-sidebar-accent"
							} group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:rounded-md`}
						>
							{isActive && (
								<span className="absolute left-0 inset-y-0 w-1 rounded-r-sm bg-sidebar-primary transition-all duration-200 group-data-[collapsible=icon]:hidden" />
							)}

							<Icon
								className={`size-4 shrink-0 transition-colors ${textColor}`}
							/>

							<span
								className={`transition-colors group-data-[collapsible=icon]:hidden ${textColor}`}
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
