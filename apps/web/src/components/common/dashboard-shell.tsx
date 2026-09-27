"use client";

import type { AppearanceWorkspaceLayout } from "@ecommand/shared";
import type { ComponentType, ReactNode } from "react";
import { AppHeader } from "@/components/common/app-header";
import { CenteredAppHeader } from "@/components/common/centered-app-header";
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
				<div className="print:hidden">
					<AppHeader />
				</div>
				<main className={workspaceContentClassName}>{children}</main>
			</SidebarInset>
			{modal}
		</SidebarProvider>
	);
}

function CenteredHeaderWorkspace({ children, modal }: DashboardWorkspaceProps) {
	return (
		<div className="@container/workspace flex min-h-screen w-full min-w-0 flex-col">
			<CenteredAppHeader />
			<main className={`${workspaceContentClassName} flex-1`}>
				<WorkspaceBreadcrumbs />
				{children}
			</main>
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
