"use client";

import Link from "next/link";
import { Fragment } from "react";
import { NotificationLink } from "@/components/notifications/notification-link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useBreadcrumbs } from "@/providers/breadcrumb-provider";

export function AppHeader() {
	const { breadcrumbs } = useBreadcrumbs();

	return (
		<header className="flex h-16 items-center gap-4 border-b px-4">
			<SidebarTrigger />

			{breadcrumbs.length > 0 && (
				<>
					<div className="flex h-8">
						<Separator orientation="vertical" />
					</div>

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
				</>
			)}
			<NotificationLink />
		</header>
	);
}
