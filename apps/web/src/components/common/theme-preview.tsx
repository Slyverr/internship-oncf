import type { ThemeMode } from "@/providers/appearance-provider";

const previewSize = {
	compact: "h-9 w-14",
	default: "h-12 w-20",
} as const;

function ThemeSample({ theme }: { theme: Exclude<ThemeMode, "system"> }) {
	return (
		<span
			data-theme={theme}
			className="grid min-w-0 grid-cols-[8px_minmax(0,1fr)] gap-compact overflow-hidden bg-background p-compact"
		>
			<span className="rounded-sm bg-sidebar" />
			<span className="grid min-w-0 content-start gap-compact pt-compact">
				<span className="grid grid-cols-[minmax(0,1fr)_8px] items-center gap-compact">
					<span className="h-1 rounded-full bg-foreground/50" />
					<span className="size-2 rounded-sm bg-primary" />
				</span>
				<span className="grid grid-cols-2 gap-compact">
					<span className="h-2 rounded-sm bg-card ring-1 ring-border" />
					<span className="h-2 rounded-sm bg-muted" />
				</span>
				<span className="h-1 w-2/3 rounded-full bg-muted-foreground/50" />
			</span>
		</span>
	);
}

export function ThemePreview({
	theme,
	size = "default",
}: {
	theme: ThemeMode;
	size?: "compact" | "default";
}) {
	const dimensions = previewSize[size];
	return (
		<span
			aria-hidden="true"
			className={`grid shrink-0 overflow-hidden rounded-md border border-border ${dimensions} ${theme === "system" ? "grid-cols-2" : "grid-cols-1"}`}
		>
			{theme === "system" ? (
				<>
					<ThemeSample theme="light" />
					<ThemeSample theme="dark" />
				</>
			) : (
				<ThemeSample theme={theme} />
			)}
		</span>
	);
}
