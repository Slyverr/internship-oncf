"use client";

import {
	CheckCircle2Icon,
	CloudOffIcon,
	LoaderCircleIcon,
	SettingsIcon,
	ShieldCheckIcon,
	UserRoundIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { type MessageKey, Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { useAppearanceSyncStatus } from "@/providers/appearance-preferences-sync";
import { useAppearance } from "@/providers/appearance-provider";
import { SettingsPanel, type SettingsSection } from "./settings-panel";

const sections: {
	id: SettingsSection;
	labelKey: MessageKey;
	icon: typeof SettingsIcon;
}[] = [
	{
		id: "appearance",
		labelKey: Messages.settings.sections.appearance,
		icon: SettingsIcon,
	},
	{
		id: "profile",
		labelKey: Messages.settings.sections.profile,
		icon: UserRoundIcon,
	},
	{
		id: "security",
		labelKey: Messages.settings.sections.security,
		icon: ShieldCheckIcon,
	},
];

function isSettingsSection(value: string | null): value is SettingsSection {
	return sections.some((section) => section.id === value);
}

function AppearanceSyncIndicator() {
	const t = useTranslate();
	const status = useAppearanceSyncStatus();
	const statusCopy = {
		loading: t(Messages.settings.sync.loading),
		saving: t(Messages.settings.sync.saving),
		saved: t(Messages.settings.sync.saved),
		local: t(Messages.settings.sync.local),
	}[status];
	const StatusIcon =
		status === "loading" || status === "saving"
			? LoaderCircleIcon
			: status === "saved"
				? CheckCircle2Icon
				: CloudOffIcon;

	return (
		<span
			role="status"
			aria-live="polite"
			className="inline-flex min-w-0 items-center gap-compact text-meta text-muted-foreground"
		>
			<StatusIcon
				aria-hidden="true"
				className={`size-4 shrink-0 ${status === "loading" || status === "saving" ? "animate-spin motion-reduce:animate-none" : ""}`}
			/>
			<span className="truncate">{statusCopy}</span>
		</span>
	);
}

export function SettingsDialog({
	closeToDashboard = false,
}: {
	closeToDashboard?: boolean;
} = {}) {
	const t = useTranslate();
	const { preferences } = useAppearance();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const sectionParam = searchParams.get("section");
	const activeSection = isSettingsSection(sectionParam)
		? sectionParam
		: "appearance";
	const previousSection = useRef(activeSection);
	const currentSearch = searchParams.toString();
	const query = useMemo(
		() => new URLSearchParams(currentSearch),
		[currentSearch],
	);
	const sectionRailWidthClass =
		preferences.textSize === "large"
			? "lg:grid-cols-[12rem_minmax(0,1fr)]"
			: "lg:grid-cols-[11rem_minmax(0,1fr)]";

	useEffect(() => {
		if (previousSection.current === activeSection) return;

		previousSection.current = activeSection;
		document
			.getElementById(`settings-tab-${activeSection}`)
			?.focus({ preventScroll: true });
	}, [activeSection]);

	function selectSection(section: SettingsSection) {
		query.set("section", section);
		const nextSearch = query.toString();
		router.replace(nextSearch ? `${pathname}?${nextSearch}` : pathname, {
			scroll: false,
		});
	}

	function handleSectionKeyDown(
		event: React.KeyboardEvent<HTMLButtonElement>,
		currentIndex: number,
	) {
		const direction =
			event.key === "ArrowRight" || event.key === "ArrowDown"
				? 1
				: event.key === "ArrowLeft" || event.key === "ArrowUp"
					? -1
					: 0;
		const nextIndex =
			event.key === "Home"
				? 0
				: event.key === "End"
					? sections.length - 1
					: (currentIndex + direction + sections.length) % sections.length;
		if (!direction && event.key !== "Home" && event.key !== "End") return;

		event.preventDefault();
		const nextSection = sections[nextIndex];
		selectSection(nextSection.id);
		document.getElementById(`settings-tab-${nextSection.id}`)?.focus();
	}

	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (open) return;
				if (closeToDashboard) router.replace("/dashboard");
				else router.back();
			}}
		>
			<DialogContent size="settings" className="gap-0 overflow-hidden p-0">
				<DialogHeader className="h-14 flex-row items-center border-b px-4 py-0 pb-0">
					<div className="flex min-w-0 items-center gap-3">
						<DialogTitle className="shrink-0 text-base">
							{t(Messages.settings.dialogTitle)}
						</DialogTitle>
						<AppearanceSyncIndicator />
					</div>
				</DialogHeader>
				<DialogBody
					className={`grid min-h-0 min-w-0 grid-cols-1 grid-rows-[max-content_minmax(0,1fr)] overflow-hidden p-0 lg:grid-rows-1 ${sectionRailWidthClass}`}
				>
					<div
						role="tablist"
						aria-label={t(Messages.settings.sections.label)}
						className="flex min-w-0 gap-2 border-b px-3 py-3 lg:flex-col lg:gap-control lg:overflow-visible lg:border-r lg:border-b-0 lg:p-4"
					>
						{sections.map(({ id, labelKey, icon: Icon }, index) => (
							<button
								key={id}
								type="button"
								role="tab"
								id={`settings-tab-${id}`}
								aria-selected={activeSection === id}
								aria-controls="settings-panel"
								tabIndex={activeSection === id ? 0 : -1}
								onClick={() => selectSection(id)}
								onKeyDown={(event) => handleSectionKeyDown(event, index)}
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
								<span className="leading-tight lg:truncate">{t(labelKey)}</span>
							</button>
						))}
					</div>
					<section
						role="tabpanel"
						id="settings-panel"
						aria-labelledby={`settings-tab-${activeSection}`}
						className="@container/settings min-h-0 min-w-0 overflow-y-auto p-4 sm:p-6"
					>
						<SettingsPanel section={activeSection} />
					</section>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
