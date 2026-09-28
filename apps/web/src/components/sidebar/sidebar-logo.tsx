import Image from "next/image";
import Link from "next/link";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SidebarLogo() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					render={<Link href="/dashboard" />}
					className="h-12 hover:bg-sidebar-accent/30 group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:hover:text-sidebar-primary"
				>
					<div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-sm oncf-brand-surface p-1 text-sidebar-primary-foreground shadow-sm shadow-sidebar-primary/30">
						<Image
							src="/oncf.png"
							alt="ONCF Mark"
							width={24}
							height={12}
							className="h-3 w-6 object-cover object-[center_40%] oncf-brand-mark"
							priority
						/>
					</div>

					<div className="grid min-w-0 max-w-40 flex-1 overflow-hidden text-left text-sm leading-tight transition-[max-width,opacity] duration-200 ease-linear motion-reduce:transition-none group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
						<span className="truncate font-bold tracking-tight text-sidebar-foreground">
							ONCF
						</span>
						<span className="truncate text-meta font-medium text-muted-foreground">
							Freight Portal
						</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
