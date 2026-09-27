"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/providers/auth-provider";
import { sidebarRoutes } from "../sidebar/sidebar-routes";

export function CenteredNavigation() {
	const pathname = usePathname();
	const { hasPermission } = useAuth();
	const visibleRoutes = sidebarRoutes.filter(
		(route) => !route.permission || hasPermission(route.permission),
	);

	return (
		<TooltipProvider>
			<nav
				aria-label="Main navigation"
				className="flex min-w-0 items-center justify-start gap-control overflow-x-auto md:justify-center md:overflow-visible"
			>
				{visibleRoutes.map((route) => {
					const isActive = route.exact
						? pathname === route.url
						: pathname === route.url || pathname?.startsWith(`${route.url}/`);
					const Icon = route.icon;

					return (
						<Tooltip key={route.title}>
							<TooltipTrigger
								render={
									<Link
										href={route.url}
										aria-label={route.title}
										aria-current={isActive ? "page" : undefined}
										className={`inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
											isActive
												? "bg-primary/10 text-primary"
												: "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
										}`}
									/>
								}
							>
								<Icon aria-hidden="true" className="size-5" />
							</TooltipTrigger>
							<TooltipContent
								side="bottom"
								className="rounded-md bg-popover px-control py-compact text-xs text-popover-foreground shadow-sm ring-1 ring-border"
							>
								{route.title}
							</TooltipContent>
						</Tooltip>
					);
				})}
			</nav>
		</TooltipProvider>
	);
}
