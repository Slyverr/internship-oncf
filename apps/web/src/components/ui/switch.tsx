"use client";

type SwitchProps = {
	checked: boolean;
	"aria-label": string;
	label?: string;
	disabled?: boolean;
	onCheckedChange: (checked: boolean) => void;
};

export function Switch({
	checked,
	"aria-label": ariaLabel,
	label,
	disabled = false,
	onCheckedChange,
}: SwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={ariaLabel}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={`inline-flex h-11 shrink-0 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-100 ${label ? "px-1 hover:bg-transparent" : "size-11 hover:bg-muted/40"}`}
		>
			{label ? (
				<span
					aria-hidden="true"
					data-checked={checked}
					className="inline-flex h-7 items-center gap-2 rounded-full border border-border bg-muted/50 px-3 text-xs font-medium text-muted-foreground transition-colors data-[checked=true]:border-primary/30 data-[checked=true]:bg-primary/10 data-[checked=true]:text-primary"
				>
					<span>{label}</span>
					<span
						data-checked={checked}
						className="relative h-4 w-7 rounded-full bg-muted-foreground/30 transition-colors data-[checked=true]:bg-primary"
					>
						<span className="absolute top-1/2 left-0.5 size-3 -translate-y-1/2 rounded-full bg-background shadow-sm transition-transform data-[checked=true]:translate-x-3" />
					</span>
				</span>
			) : (
				<span
					aria-hidden="true"
					data-checked={checked}
					className="relative h-6 w-10 rounded-full border border-input bg-muted transition-colors data-[checked=true]:border-primary data-[checked=true]:bg-primary"
				>
					<span
						data-checked={checked}
						className="absolute top-1/2 left-1 size-4 -translate-y-1/2 rounded-full bg-background shadow-sm transition-transform data-[checked=true]:translate-x-4"
					/>
				</span>
			)}
		</button>
	);
}
