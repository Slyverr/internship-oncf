"use client";

import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";

export function UnderConstruction() {
	const t = useTranslate();
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
			<h1 className="text-2xl font-bold">
				🚧 {t(Messages.common.underConstruction.title)}
			</h1>
			<p className="text-muted-foreground">
				{t(Messages.common.underConstruction.description)}
			</p>
		</div>
	);
}
