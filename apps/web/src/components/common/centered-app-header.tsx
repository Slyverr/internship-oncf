"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { CenteredNavigation } from "@/components/common/centered-navigation";
import { NotificationLink } from "@/components/notifications/notification-link";
import { SidebarUser } from "@/components/sidebar/sidebar-user";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/providers/breadcrumb-provider";

export function CenteredAppHeader() {
	const { breadcrumbs } = useBreadcrumbs();

	return (
		<>
			<header className="sticky top-0 z-40 w-full px-4 print:static">
				<div className="relative mx-auto w-full max-w-screen-2xl">
					<svg
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 h-full w-full overflow-visible drop-shadow-sm"
						viewBox="0 0 1000 100"
						preserveAspectRatio="none"
					>
						<path
							d="M0 0 H1000 C1008 0 1016 8 1016 24 C1016 46 1000 54 1000 76 V84 Q1000 100 984 100 H16 Q0 100 0 84 V76 C0 54 -16 46 -16 24 C-16 8 -8 0 0 0 Z"
							className="fill-card stroke-border"
							strokeWidth="1"
							vectorEffect="non-scaling-stroke"
						/>
					</svg>
					<div className="relative grid min-h-16 w-full grid-cols-[1fr_auto] items-center gap-control px-4 py-control sm:px-8 md:px-12 lg:flex lg:h-16 lg:gap-6 lg:px-20 lg:py-0">
						<Link
							href="/dashboard"
							aria-label="ECommand home"
							className="inline-flex min-h-11 items-center gap-control rounded-md text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:order-1"
						>
							<span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-sidebar-primary p-control">
								<Image
									src="/oncf.png"
									alt=""
									width={24}
									height={12}
									className="h-3 w-6 object-cover object-[center_40%] brightness-0 invert"
									priority
								/>
							</span>
							<span>ECommand</span>
						</Link>

						<div className="ml-auto flex items-center gap-control lg:order-3">
							<NotificationLink />
							<SidebarUser variant="header" />
						</div>

						<div className="col-span-2 row-start-2 min-w-0 border-t pt-control lg:order-2 lg:flex-1 lg:border-0 lg:pt-0">
							<CenteredNavigation />
						</div>
					</div>
				</div>
			</header>

			{breadcrumbs.length > 0 && (
				<div className="mx-auto w-full max-w-screen-2xl px-4 py-control sm:px-6">
					<div className="flex items-center gap-control">
						<Breadcrumb className="min-w-0 flex-1 overflow-hidden">
							<BreadcrumbList className="min-w-0 flex-nowrap overflow-hidden">
								{breadcrumbs.map((breadcrumb, index) => {
									const isLast = index === breadcrumbs.length - 1;
									const key = `${breadcrumb.href ?? "current"}-${breadcrumb.label}`;

									return (
										<Fragment key={key}>
											<BreadcrumbItem
												className={
													index < breadcrumbs.length - 1
														? "hidden sm:inline-flex"
														: "min-w-0"
												}
											>
												{isLast || !breadcrumb.href ? (
													<BreadcrumbPage className="block max-w-64 truncate">
														{breadcrumb.label}
													</BreadcrumbPage>
												) : (
													<BreadcrumbLink
														render={<Link href={breadcrumb.href} />}
													>
														{breadcrumb.label}
													</BreadcrumbLink>
												)}
											</BreadcrumbItem>

											{!isLast && (
												<BreadcrumbSeparator className="hidden sm:block" />
											)}
										</Fragment>
									);
								})}
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</div>
			)}
		</>
	);
}
