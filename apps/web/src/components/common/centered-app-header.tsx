"use client";

import Image from "next/image";
import Link from "next/link";
import { CenteredNavigation } from "@/components/common/centered-navigation";
import { WorkspaceLayoutSwitch } from "@/components/common/workspace-layout-switch";
import { NotificationLink } from "@/components/notifications/notification-link";
import { SidebarUser } from "@/components/sidebar/sidebar-user";
import { useAuth } from "@/providers/auth-provider";

export function CenteredAppHeader() {
	const { profile } = useAuth();
	const customerName =
		profile.customerId === null
			? null
			: (profile.customerName ?? `Customer account #${profile.customerId}`);

	return (
		<header className="sticky top-0 z-40 w-full px-0 print:static">
			<div className="relative mx-auto w-full max-w-screen-2xl md:rounded-b-2xl md:border md:border-border md:bg-card md:shadow-sm">
				<div className="relative z-10 grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-y-0 pl-control pr-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:px-4 lg:h-16 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
					<div className="hidden min-w-0 items-center justify-start md:col-start-1 md:row-start-1 md:flex">
						<Link
							href="/dashboard"
							aria-label="ECommand home"
							className="inline-flex min-h-16 items-center gap-control rounded-md text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<span className="flex size-8 shrink-0 items-center justify-center rounded-sm oncf-brand-surface p-control">
								<Image
									src="/oncf.png"
									alt=""
									width={24}
									height={12}
									className="h-3 w-6 object-cover object-[center_40%] oncf-brand-mark"
									priority
								/>
							</span>
							{customerName && (
								<span className="max-w-48 truncate text-sm font-medium text-muted-foreground xl:max-w-64">
									{customerName}
								</span>
							)}
						</Link>
					</div>

					<div className="col-span-2 row-start-2 hidden min-w-0 border-t pt-control pb-compact md:flex md:w-full md:items-center md:justify-center lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:w-max lg:justify-self-center lg:border-0 lg:py-0">
						<CenteredNavigation />
					</div>

					<div className="ml-auto flex h-12 self-start items-center justify-end gap-3 rounded-bl-2xl border-b border-l border-border bg-card p-control shadow-sm md:col-start-2 md:row-start-1 md:ml-0 md:h-16 md:w-full md:self-center md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none lg:col-start-3">
						<WorkspaceLayoutSwitch />
						<NotificationLink />
						<SidebarUser variant="header" />
					</div>
				</div>
			</div>
		</header>
	);
}
