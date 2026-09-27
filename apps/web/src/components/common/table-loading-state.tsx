import { LoaderCircleIcon } from "lucide-react";

export function TableLoadingState({ resource }: { resource: string }) {
	return (
		<div
			role="status"
			className="flex min-h-40 items-center justify-center gap-4 rounded-lg border bg-card p-8 text-sm text-muted-foreground"
		>
			<LoaderCircleIcon
				className="size-4 animate-spin motion-reduce:animate-none"
				aria-hidden="true"
			/>
			<span>Loading {resource}…</span>
		</div>
	);
}
