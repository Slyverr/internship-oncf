"use client";

import { SettingsIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { SettingsPanel, type SettingsSection } from "./settings-panel";

const sections: {
	id: SettingsSection;
	label: string;
	icon: typeof SettingsIcon;
}[] = [
	{ id: "appearance", label: "Appearance", icon: SettingsIcon },
	{ id: "profile", label: "Profile", icon: UserRoundIcon },
	{ id: "security", label: "Security", icon: ShieldCheckIcon },
];

function isSettingsSection(value: string | null): value is SettingsSection {
	return sections.some((section) => section.id === value);
}

export function SettingsDialog() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const sectionParam = searchParams.get("section");
	const activeSection = isSettingsSection(sectionParam)
		? sectionParam
		: "appearance";
	const currentSearch = searchParams.toString();
	const query = useMemo(
		() => new URLSearchParams(currentSearch),
		[currentSearch],
	);

	function selectSection(section: SettingsSection) {
		query.set("section", section);
		const nextSearch = query.toString();
		router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, {
			scroll: false,
		});
	}

	return (
		<Dialog open onOpenChange={(open) => !open && router.back()}>
			<DialogContent
				size="settings"
				className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0"
			>
				<DialogHeader className="min-h-12 flex-row items-center border-b px-4 py-0 pr-16 pb-0">
					<DialogTitle className="text-base">Settings</DialogTitle>
				</DialogHeader>
				<div className="grid min-h-0 min-w-0 grid-cols-1 grid-rows-[max-content_minmax(0,1fr)] lg:grid-cols-[11rem_minmax(0,1fr)] lg:grid-rows-1">
					<nav
						aria-label="Settings sections"
						className="flex min-w-0 gap-2 border-b px-3 py-3 lg:flex-col lg:gap-control lg:overflow-visible lg:border-r lg:border-b-0 lg:p-4"
					>
						{sections.map(({ id, label, icon: Icon }) => (
							<button
								key={id}
								type="button"
								id={`settings-tab-${id}`}
								aria-current={activeSection === id ? "page" : undefined}
								onClick={() => selectSection(id)}
								className={`flex h-12 min-w-0 flex-1 items-center justify-center gap-control rounded-lg px-1 text-center text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex-none lg:justify-start lg:px-4 lg:text-left lg:text-sm ${
									activeSection === id
										? "bg-muted text-foreground"
										: "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
								}`}
							>
								<Icon
									aria-hidden="true"
									className="hidden size-4 shrink-0 lg:block"
								/>
								<span className="leading-tight lg:truncate">{label}</span>
							</button>
						))}
					</nav>
					<section
						id="settings-panel"
						aria-labelledby={`settings-tab-${activeSection}`}
						className="min-h-0 min-w-0 overflow-y-auto p-4 sm:p-6"
					>
						<SettingsPanel section={activeSection} />
					</section>
				</div>
			</DialogContent>
		</Dialog>
	);
}
