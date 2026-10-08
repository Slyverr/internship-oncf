"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { useAuth } from "@/providers/auth-provider";
import {
	getVisibleSidebarNavigation,
	isSidebarNavigationItemActive,
	isSidebarRouteActive,
} from "../sidebar/sidebar-routes";

export function CenteredNavigation({ compact = false }: { compact?: boolean }) {
	const t = useTranslate();
	const pathname = usePathname();
	const { hasPermission } = useAuth();
	const navigationRef = useRef<HTMLElement>(null);
	const navigationItemsRef = useRef<HTMLDivElement>(null);
	const navigationId = useId();
	const [hasOverflow, setHasOverflow] = useState(false);
	const [navigationWidth, setNavigationWidth] = useState(0);
	const visibleRoutes = getVisibleSidebarNavigation(hasPermission);

	useEffect(() => {
		const navigation = navigationRef.current;
		if (!navigation) return;

		const updateScrollEdges = () => {
			const maxScrollLeft = navigation.scrollWidth - navigation.clientWidth;
			setNavigationWidth((width) =>
				width === navigation.clientWidth ? width : navigation.clientWidth,
			);
			setHasOverflow(maxScrollLeft > 1);
		};

		updateScrollEdges();
		const observer = new ResizeObserver(updateScrollEdges);
		observer.observe(navigation);
		if (navigationItemsRef.current) {
			observer.observe(navigationItemsRef.current);
		}
		navigation.addEventListener("scroll", updateScrollEdges, { passive: true });

		return () => {
			observer.disconnect();
			navigation.removeEventListener("scroll", updateScrollEdges);
		};
	}, []);

	useEffect(() => {
		const navigation = navigationRef.current;
		if (!navigation || navigationWidth === 0) return;
		const activeControl = navigation.querySelector<HTMLElement>(
			`[data-navigation-path='${pathname}']`,
		);
		if (!activeControl) return;

		const navigationBounds = navigation.getBoundingClientRect();
		const activeBounds = activeControl.getBoundingClientRect();
		const edgeInset = 16;
		const visibleLeft = navigationBounds.left + edgeInset;
		const visibleRight = navigationBounds.right - edgeInset;
		const scrollDelta =
			activeBounds.left < visibleLeft
				? activeBounds.left - visibleLeft
				: activeBounds.right > visibleRight
					? activeBounds.right - visibleRight
					: 0;

		if (scrollDelta !== 0) {
			const reduceMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			navigation.scrollBy({
				left: scrollDelta,
				behavior: reduceMotion ? "auto" : "smooth",
			});
		}
	}, [pathname, navigationWidth]);

	return (
		<TooltipProvider>
			<div className="flex w-full min-w-0 items-center">
				<nav
					ref={navigationRef}
					id={navigationId}
					aria-label={t(
						hasOverflow
							? Messages.navigation.mainScrollable
							: Messages.navigation.main,
					)}
					className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible"
				>
					<div
						ref={navigationItemsRef}
						className={`flex w-max min-w-full items-center ${compact ? "justify-center gap-2 px-4" : "justify-center gap-control px-4 lg:gap-compact lg:px-0"}`}
					>
						{visibleRoutes.map((item) => {
							if ("kind" in item) {
								const label = t(item.titleKey);
								const isActive = isSidebarNavigationItemActive(item, pathname);
								const Icon = item.icon;

								return (
									<DropdownMenu key={item.id}>
										<Tooltip>
											<TooltipTrigger
												render={
													<DropdownMenuTrigger
														aria-label={label}
														aria-current={isActive ? "page" : undefined}
														data-active-navigation={
															isActive ? "true" : undefined
														}
														data-navigation-path={
															isActive ? pathname : undefined
														}
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
												{label}
											</TooltipContent>
										</Tooltip>
										<DropdownMenuContent align="center" className="min-w-52">
											{item.children.map((route) => {
												const ChildIcon = route.icon;
												const childActive = isSidebarRouteActive(
													route,
													pathname,
												);
												return (
													<DropdownMenuItem
														key={route.url}
														render={
															<Link
																href={route.url}
																aria-current={childActive ? "page" : undefined}
															/>
														}
													>
														<ChildIcon aria-hidden="true" />
														{t(route.titleKey)}
													</DropdownMenuItem>
												);
											})}
										</DropdownMenuContent>
									</DropdownMenu>
								);
							}
							const route = item;
							const label = t(route.titleKey);
							const isActive = isSidebarRouteActive(route, pathname);
							const Icon = route.icon;

							return (
								<Tooltip key={route.url}>
									<TooltipTrigger
										render={
											<Link
												href={route.url}
												aria-label={label}
												aria-current={isActive ? "page" : undefined}
												data-active-navigation={isActive ? "true" : undefined}
												data-navigation-path={isActive ? pathname : undefined}
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
										{label}
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</nav>
			</div>
		</TooltipProvider>
	);
}
