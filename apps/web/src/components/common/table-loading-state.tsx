"use client";

import { LoaderCircleIcon } from "lucide-react";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";

export function TableLoadingState({ resource }: { resource: string }) {
	const t = useTranslate();
	return (
		<div
			role="status"
			className="flex min-h-40 items-center justify-center gap-4 rounded-lg border bg-card p-8 text-sm text-muted-foreground"
		>
			<LoaderCircleIcon
				className="size-4 animate-spin motion-reduce:animate-none"
				aria-hidden="true"
			/>
			<span>{t(Messages.common.loadingResource, { resource })}</span>
		</div>
	);
}
