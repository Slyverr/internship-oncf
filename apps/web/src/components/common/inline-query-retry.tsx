import { LoaderCircleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InlineQueryRetry({
	message,
	retryLabel,
	isFetching,
	onRetry,
}: {
	message: string;
	retryLabel: string;
	isFetching: boolean;
	onRetry: () => void;
}) {
	return (
		<div
			role="alert"
			aria-busy={isFetching}
			className="flex flex-col items-start gap-3"
		>
			<p className="text-sm text-destructive">{message}</p>
			<Button
				type="button"
				variant="outline"
				disabled={isFetching}
				onClick={onRetry}
			>
				{isFetching ? (
					<LoaderCircleIcon
						aria-hidden="true"
						className="animate-spin motion-reduce:animate-none"
					/>
				) : (
					<RefreshCwIcon aria-hidden="true" />
				)}
				{isFetching ? "Retrying…" : retryLabel}
			</Button>
		</div>
	);
}
