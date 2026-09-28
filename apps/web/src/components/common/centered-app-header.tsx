"use client";

import Image from "next/image";
import Link from "next/link";
import { CenteredNavigation } from "@/components/common/centered-navigation";
import { NotificationLink } from "@/components/notifications/notification-link";
import { SidebarUser } from "@/components/sidebar/sidebar-user";

export function CenteredAppHeader() {
	return (
		<header className="sticky top-0 z-40 w-full px-0 print:static md:px-4">
			<div className="relative mx-auto w-full max-w-screen-2xl">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-y-0 right-0 left-auto w-28 rounded-bl-2xl border-b border-l border-border bg-card shadow-sm md:inset-0 md:w-auto md:rounded-b-2xl md:border"
				></div>
				<div className="relative z-10 grid min-h-16 w-full grid-cols-[1fr_auto] items-center gap-x-control gap-y-0 px-0 sm:px-8 md:flex md:h-16 md:gap-6 md:px-12 lg:px-20">
					<Link
						href="/dashboard"
						aria-label="ECommand home"
						className="inline-flex min-h-16 items-center gap-control rounded-md px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-md:hidden md:order-1"
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
					</Link>

					<div className="ml-auto flex h-16 w-28 items-center justify-end gap-control pr-control pl-0 md:min-h-16 md:w-auto md:px-0 md:order-3">
						<NotificationLink />
						<SidebarUser variant="header" />
					</div>

					<div className="col-span-2 row-start-2 hidden min-w-0 border-t pt-control pb-compact md:order-2 md:flex-1 md:border-0 md:py-0 md:block">
						<CenteredNavigation />
					</div>
				</div>
			</div>
		</header>
	);
}
