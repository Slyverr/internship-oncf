"use client";

import { LoaderCircleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";

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
	const t = useTranslate();
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
				{isFetching ? t(Messages.common.actions.retrying) : retryLabel}
			</Button>
		</div>
	);
}
