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
					className="h-12 hover:bg-sidebar-accent"
				>
					<div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-sm bg-sidebar-primary p-1 text-sidebar-primary-foreground shadow-sm shadow-sidebar-primary/30">
						<Image
							src="/oncf.png"
							alt="ONCF Mark"
							width={24}
							height={24}
							className="size-full object-contain brightness-0 invert"
							priority
						/>
					</div>

					<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
						<span className="truncate font-bold tracking-tight text-sidebar-foreground">
							ONCF
						</span>
						<span className="truncate text-xs font-medium text-muted-foreground">
							Freight Portal
						</span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
