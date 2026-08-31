"use client";

import {
	ChevronsUpDownIcon,
	LogOutIcon,
	SettingsIcon,
	UserIcon,
} from "lucide-react";
import Link from "next/link";

import { logout } from "@/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";

export function SidebarUser() {
	const {
		profile: { firstName, lastName, role },
	} = useAuth();

	const name = `${firstName} ${lastName}`;
	const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								className="h-12 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							/>
						}
					>
						<Avatar className="size-8 shrink-0 rounded-sm">
							<AvatarImage alt={name} />
							<AvatarFallback className="rounded-sm bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-sm shadow-sidebar-primary/30">
								{initials}
							</AvatarFallback>
						</Avatar>

						<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
							<span className="truncate font-medium">{name}</span>
							<span className="truncate text-xs text-muted-foreground">
								{role}
							</span>
						</div>

						<ChevronsUpDownIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						align="end"
						sideOffset={4}
					>
						<DropdownMenuItem render={<Link href="/profile" />}>
							<UserIcon className="mr-2 size-4 text-muted-foreground" />
							Profile
						</DropdownMenuItem>

						<DropdownMenuItem>
							<SettingsIcon className="mr-2 size-4 text-muted-foreground" />
							Settings
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={logout}
							className="text-destructive focus:text-destructive"
						>
							<LogOutIcon className="mr-2 size-4" />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
