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
import { Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { formatUserRole } from "@/lib/user-labels";
import { useAuth } from "@/providers/auth-provider";

export function SidebarUser({
	variant = "sidebar",
}: {
	variant?: "sidebar" | "header";
} = {}) {
	const t = useTranslate();
	const locale = useLocale();
	const {
		profile: { firstName, lastName, role, customerId, customerName },
	} = useAuth();

	const name = `${firstName} ${lastName}`;
	const accountName =
		customerId === null
			? null
			: (customerName ??
				t(Messages.settings.profile.customerAccountCodeFallback, {
					id: customerId,
				}));
	const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
	const trigger =
		variant === "sidebar" ? (
			<SidebarMenuButton
				size="lg"
				className="h-auto min-h-16 hover:bg-sidebar-accent/30 group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:hover:text-sidebar-primary data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
			/>
		) : (
			<button
				type="button"
				className="relative inline-flex size-8 items-center justify-center rounded-md border border-transparent p-0 after:absolute after:-inset-1.5 after:content-[''] transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			/>
		);
	const menu = (
		<DropdownMenu>
			<DropdownMenuTrigger
				aria-label={t(Messages.common.accessibility.accountMenuFor, {
					name,
				})}
				render={trigger}
			>
				<Avatar className="size-8 shrink-0 rounded-sm">
					<AvatarImage alt={name} />
					<AvatarFallback className="rounded-sm bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-sm shadow-sidebar-primary/30">
						{initials}
					</AvatarFallback>
				</Avatar>

				{variant === "sidebar" && (
					<>
						<div className="grid min-w-0 max-w-40 flex-1 overflow-hidden text-left text-sm leading-tight transition-[max-width,opacity] duration-200 ease-linear motion-reduce:transition-none group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0">
							<span className="truncate font-medium">{name}</span>
							<span className="truncate text-meta text-muted-foreground">
								{formatUserRole(role, locale)}
							</span>
							{accountName && (
								<span className="truncate text-micro text-muted-foreground">
									{accountName}
								</span>
							)}
						</div>

						<ChevronsUpDownIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
					</>
				)}
			</DropdownMenuTrigger>

			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				align="end"
				sideOffset={4}
			>
				<DropdownMenuItem
					render={<Link href="/dashboard/settings?section=profile" />}
				>
					<UserIcon className="mr-2 size-4 text-muted-foreground" />
					{t(Messages.settings.sections.profile)}
				</DropdownMenuItem>

				<DropdownMenuItem
					render={<Link href="/dashboard/settings?section=appearance" />}
				>
					<SettingsIcon className="mr-2 size-4 text-muted-foreground" />
					{t(Messages.settings.dialogTitle)}
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					onClick={logout}
					className="text-destructive focus:text-destructive"
				>
					<LogOutIcon className="mr-2 size-4" />
					{t(Messages.common.actions.logOut)}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	return variant === "sidebar" ? (
		<SidebarMenu>
			<SidebarMenuItem>{menu}</SidebarMenuItem>
		</SidebarMenu>
	) : (
		menu
	);
}
