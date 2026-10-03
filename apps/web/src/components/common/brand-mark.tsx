import Image from "next/image";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";

export function OncfMark() {
	const t = useTranslate();

	return (
		<span className="relative block h-3 w-6 shrink-0">
			<Image
				src="/oncf.png"
				alt={t(Messages.common.accessibility.oncfMark)}
				fill
				sizes="24px"
				className="object-cover object-[center_40%] oncf-brand-mark"
				priority
			/>
		</span>
	);
}
