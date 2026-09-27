"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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
	const navigationRef = useRef<HTMLElement>(null);
	const navigationItemsRef = useRef<HTMLDivElement>(null);
	const navigationId = useId();
	const [hasOverflow, setHasOverflow] = useState(false);
	const [navigationWidth, setNavigationWidth] = useState(0);
	const [scrollEdges, setScrollEdges] = useState({ left: false, right: false });
	const visibleRoutes = sidebarRoutes.filter(
		(route) => !route.permission || hasPermission(route.permission),
	);
	const activeRoute = visibleRoutes.find((route) =>
		route.exact
			? pathname === route.url
			: pathname === route.url || pathname?.startsWith(`${route.url}/`),
	);

	useEffect(() => {
		const navigation = navigationRef.current;
		if (!navigation) return;

		const updateScrollEdges = () => {
			const maxScrollLeft = navigation.scrollWidth - navigation.clientWidth;
			setNavigationWidth((width) =>
				width === navigation.clientWidth ? width : navigation.clientWidth,
			);
			setHasOverflow(maxScrollLeft > 1);
			setScrollEdges({
				left: navigation.scrollLeft > 1,
				right: maxScrollLeft - navigation.scrollLeft > 1,
			});
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
		const activeLink = Array.from(
			navigation?.querySelectorAll<HTMLAnchorElement>("a") ?? [],
		).find((link) => link.pathname === activeRoute?.url);
		if (!activeLink) return;

		const navigationBounds = navigation.getBoundingClientRect();
		const activeBounds = activeLink.getBoundingClientRect();
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
	}, [activeRoute?.url, navigationWidth]);

	function scrollNavigation(direction: -1 | 1) {
		const navigation = navigationRef.current;
		if (!navigation) return;

		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		navigation.scrollBy({
			left: direction * navigation.clientWidth * 0.75,
			behavior: reduceMotion ? "auto" : "smooth",
		});
	}

	return (
		<TooltipProvider>
			<div className="flex min-w-0 items-center">
				{hasOverflow && (
					<button
						type="button"
						aria-label="Show earlier navigation sections"
						aria-controls={navigationId}
						disabled={!scrollEdges.left}
						onClick={() => scrollNavigation(-1)}
						className="flex size-11 shrink-0 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
					>
						<ChevronLeftIcon aria-hidden="true" className="size-4" />
					</button>
				)}
				<nav
					ref={navigationRef}
					id={navigationId}
					aria-label={
						scrollEdges.left || scrollEdges.right
							? "Main navigation; scroll horizontally to see more sections"
							: "Main navigation"
					}
					className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible"
				>
					<div
						ref={navigationItemsRef}
						className="flex w-max min-w-full items-center justify-start gap-control px-4 md:justify-center md:px-0"
					>
						{visibleRoutes.map((route) => {
							const isActive = route.exact
								? pathname === route.url
								: pathname === route.url ||
									pathname?.startsWith(`${route.url}/`);
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
					</div>
				</nav>
				{hasOverflow && (
					<button
						type="button"
						aria-label="Show more navigation sections"
						aria-controls={navigationId}
						disabled={!scrollEdges.right}
						onClick={() => scrollNavigation(1)}
						className="flex size-11 shrink-0 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
					>
						<ChevronRightIcon aria-hidden="true" className="size-4" />
					</button>
				)}
			</div>
		</TooltipProvider>
	);
}
