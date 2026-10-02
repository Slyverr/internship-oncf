import type { ReactNode } from "react";

interface RecordDetailProps {
	label: string;
	value: ReactNode;
	wideValue?: boolean;
}

export function RecordDetail({
	label,
	value,
	wideValue = false,
}: RecordDetailProps) {
	return (
		<div
			className={`grid min-w-0 items-baseline gap-2 ${wideValue ? "grid-cols-[max-content_minmax(0,1fr)]" : "grid-cols-2"}`}
		>
			<span className="text-meta text-muted-foreground">{label}</span>
			<span className="min-w-0 break-words text-right text-sm font-medium sm:text-base">
				{value}
			</span>
		</div>
	);
}

export function RecordMetric({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) {
	return (
		<div className="space-y-1">
			<p className="text-meta text-muted-foreground">{label}</p>
			<p className="text-base font-semibold">{value}</p>
		</div>
	);
}
