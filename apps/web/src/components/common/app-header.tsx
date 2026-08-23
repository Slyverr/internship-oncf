"use client";

import Link from "next/link";
import { Fragment } from "react";
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
					<div className="flex h-2/5">
						<Separator orientation="vertical" />
					</div>

					<Breadcrumb>
						<BreadcrumbList>
							{breadcrumbs.map((breadcrumb, index) => {
								const isLast = index === breadcrumbs.length - 1;
								const key = `${breadcrumb.href ?? "current"}-${breadcrumb.label}`;

								return (
									<Fragment key={key}>
										<BreadcrumbItem>
											{isLast || !breadcrumb.href ? (
												<BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
											) : (
												<BreadcrumbLink
													render={<Link href={breadcrumb.href} />}
												>
													{breadcrumb.label}
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>

										{!isLast && <BreadcrumbSeparator />}
									</Fragment>
								);
							})}
						</BreadcrumbList>
					</Breadcrumb>
				</>
			)}
		</header>
	);
}
