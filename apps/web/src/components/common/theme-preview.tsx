import type { ThemeMode } from "@/providers/appearance-provider";

export function ThemePreview({
	theme,
	size = "default",
}: {
	theme: ThemeMode;
	size?: "compact" | "default";
}) {
	const compact = size === "compact";
	if (theme === "system") {
		return (
			<span
				aria-hidden="true"
				className={`grid shrink-0 grid-cols-2 overflow-hidden rounded-md border border-border ${compact ? "h-8 w-12" : "h-10 w-16"}`}
			>
				<span
					data-theme="light"
					className="grid grid-cols-[4px_1fr] gap-compact bg-background p-compact"
				>
					<span className="rounded-sm bg-sidebar" />
					<span className="mt-compact h-1 rounded-full bg-primary" />
				</span>
				<span
					data-theme="dark"
					className="grid grid-cols-[4px_1fr] gap-compact bg-background p-compact"
				>
					<span className="rounded-sm bg-sidebar" />
					<span className="mt-compact h-1 rounded-full bg-primary" />
				</span>
			</span>
		);
	}

	return (
		<span
			aria-hidden="true"
			data-theme={theme}
			className={`grid shrink-0 gap-compact overflow-hidden rounded-md border border-border bg-background ${compact ? "h-8 w-12 grid-cols-[8px_minmax(0,1fr)] p-compact" : "h-10 w-16 grid-cols-[12px_minmax(0,1fr)] p-control"}`}
		>
			<span className="rounded-sm bg-sidebar" />
			<span className="grid content-start gap-compact pt-compact">
				<span className="h-1 rounded-full bg-primary" />
				<span className="h-1 rounded-full bg-card ring-1 ring-border" />
			</span>
		</span>
	);
}
