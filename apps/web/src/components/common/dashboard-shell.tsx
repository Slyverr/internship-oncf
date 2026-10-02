"use client";

import type { AppearanceWorkspaceLayout } from "@ecommand/shared";
import type { ComponentType, ReactNode } from "react";
import { AppHeader } from "@/components/common/app-header";
import { CenteredAppHeader } from "@/components/common/centered-app-header";
import { CenteredNavigation } from "@/components/common/centered-navigation";
import { WorkspaceBreadcrumbs } from "@/components/common/workspace-breadcrumbs";
import AppSidebar from "@/components/sidebar/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAppearance } from "@/providers/appearance-provider";

type DashboardWorkspaceProps = {
	children: ReactNode;
	modal: ReactNode;
};

const workspaceContentClassName =
	"page-enter mx-auto grid w-full min-w-0 max-w-screen-2xl grid-cols-1 content-start gap-6 p-4 sm:p-6 print:p-0";

function SidebarWorkspace({ children, modal }: DashboardWorkspaceProps) {
	return (
		<SidebarProvider>
			<AppSidebar className="print:hidden" />
			<SidebarInset className="@container/workspace">
				<div className="hidden print:hidden md:block">
					<AppHeader />
				</div>
				<div className="print:hidden md:hidden">
					<CenteredAppHeader />
				</div>
				<main className={`${workspaceContentClassName} pb-24 md:pb-6`}>
					{children}
				</main>
			</SidebarInset>
			<MobileWorkspaceNavigation />
			{modal}
		</SidebarProvider>
	);
}

function MobileWorkspaceNavigation() {
	return (
		<div className="fixed inset-x-0 bottom-0 z-50 min-h-16 border-t border-border bg-card pb-safe-area shadow-md md:hidden print:hidden">
			<div className="mx-auto flex min-h-16 w-full max-w-screen-2xl items-center">
				<CenteredNavigation compact />
			</div>
		</div>
	);
}

function CenteredHeaderWorkspace({ children, modal }: DashboardWorkspaceProps) {
	return (
		<div className="@container/workspace flex min-h-screen w-full min-w-0 flex-col">
			<CenteredAppHeader />
			<main className={`${workspaceContentClassName} flex-1 pb-24 md:pb-6`}>
				<WorkspaceBreadcrumbs />
				{children}
			</main>
			<MobileWorkspaceNavigation />
			{modal}
		</div>
	);
}

const workspaceLayouts: Record<
	AppearanceWorkspaceLayout,
	ComponentType<DashboardWorkspaceProps>
> = {
	sidebar: SidebarWorkspace,
	"centered-header": CenteredHeaderWorkspace,
};

export function DashboardShell(props: DashboardWorkspaceProps) {
	const { initialized, preferences } = useAppearance();
	const selectedLayout = initialized ? preferences.workspaceLayout : "sidebar";
	const Workspace = workspaceLayouts[selectedLayout];

	return <Workspace {...props} />;
}
