"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useTranslate } from "@/i18n/locale-provider";
import { useAuth } from "@/providers/auth-provider";
import {
	getVisibleSidebarNavigation,
	isSidebarRouteActive,
} from "./sidebar-routes";

export function SidebarNav() {
	const t = useTranslate();
	const pathname = usePathname();
	const { hasPermission } = useAuth();
	const visibleRoutes = getVisibleSidebarNavigation(hasPermission);

	return (
		<SidebarMenu className="py-4 group-data-[collapsible=icon]:pt-compact">
			{visibleRoutes.map((item) => {
				if ("kind" in item) {
					const Icon = item.icon;
					const isActive = item.children.some((route) =>
						isSidebarRouteActive(route, pathname),
					);
					const children = item.children.filter(
						(route) => route.url !== item.url,
					);

					return (
						<SidebarMenuItem key={item.id}>
							<SidebarMenuButton
								render={<Link href={item.url} />}
								isActive={isActive}
								tooltip={t(item.titleKey)}
								className={`group/button relative w-full px-4 py-2 rounded-none transition-colors ${
									isActive
										? "bg-sidebar-primary/10 font-semibold dark:bg-sidebar-primary/20"
										: "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:hover:text-sidebar-primary"
								} group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:rounded-md`}
							>
								{isActive && (
									<span className="absolute left-0 inset-y-0 w-1 rounded-r-sm bg-sidebar-primary transition-all duration-200 group-data-[collapsible=icon]:hidden" />
								)}
								<Icon className="size-4 shrink-0" />
								<span className="min-w-0 max-w-48 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
									{t(item.titleKey)}
								</span>
							</SidebarMenuButton>
							<SidebarMenuSub>
								{children.map((route) => {
									const ChildIcon = route.icon;
									const childActive = isSidebarRouteActive(route, pathname);
									return (
										<SidebarMenuSubItem key={route.url}>
											<SidebarMenuSubButton
												render={
													<Link
														href={route.url}
														aria-current={childActive ? "page" : undefined}
													/>
												}
												isActive={childActive}
											>
												<ChildIcon aria-hidden="true" />
												<span>{t(route.titleKey)}</span>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									);
								})}
							</SidebarMenuSub>
						</SidebarMenuItem>
					);
				}
				const route = item;
				const isActive = isSidebarRouteActive(route, pathname);

				const Icon = route.icon;
				const textColor = isActive
					? "text-sidebar-primary"
					: "group-hover/button:text-sidebar-primary";

				return (
					<SidebarMenuItem key={route.url}>
						<SidebarMenuButton
							render={<Link href={route.url} />}
							isActive={isActive}
							tooltip={t(route.titleKey)}
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
								{t(route.titleKey)}
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				);
			})}
		</SidebarMenu>
	);
}
