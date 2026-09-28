"use client";

import Image from "next/image";
import Link from "next/link";
import { CenteredNavigation } from "@/components/common/centered-navigation";
import { NotificationLink } from "@/components/notifications/notification-link";
import { SidebarUser } from "@/components/sidebar/sidebar-user";

export function CenteredAppHeader() {
	return (
		<header className="sticky top-0 z-40 w-full px-4 print:static">
			<div className="relative mx-auto w-full max-w-screen-2xl">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 rounded-b-2xl border border-border bg-card shadow-sm"
				></div>
				<div className="relative z-10 grid min-h-16 w-full grid-cols-[1fr_auto] items-center gap-x-control gap-y-0 px-4 py-0 sm:px-8 md:px-12 lg:flex lg:h-16 lg:gap-6 lg:px-20">
					<Link
						href="/dashboard"
						aria-label="ECommand home"
						className="inline-flex min-h-16 items-center gap-control rounded-md text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:order-1"
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

					<div className="ml-auto flex min-h-16 items-center gap-control lg:order-3">
						<NotificationLink />
						<SidebarUser variant="header" />
					</div>

					<div className="col-span-2 row-start-2 min-w-0 border-t pt-control pb-compact lg:order-2 lg:flex-1 lg:border-0 lg:py-0">
						<CenteredNavigation />
					</div>
				</div>
			</div>
		</header>
	);
}
