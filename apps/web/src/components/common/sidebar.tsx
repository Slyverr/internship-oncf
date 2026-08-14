"use client"

import { ChevronsUpDownIcon, HomeIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

const routes = [
  {
    title: "Home",
    url: "/dashboard",
    icon: HomeIcon,
  },
]

const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "",
}

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const user = mockUser

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Logo */}
        <div className="flex items-center justify-center py-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
              <span className="text-lg font-bold">L</span>
            </div>
            <span className="text-xl font-bold group-data-[collapsible=icon]:hidden">Logo</span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => {
            const isActive = pathname === route.url || pathname?.startsWith(`${route.url}/`)
            const Icon = route.icon

            return (
              <SidebarMenuItem key={route.title}>
                <SidebarMenuButton
                  render={<Link href={route.url} />}
                  isActive={isActive}
                  tooltip={route.title}
                >
                  {Icon && <Icon />}
                  <span>{route.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDownIcon className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <UserIcon />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SettingsIcon />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
