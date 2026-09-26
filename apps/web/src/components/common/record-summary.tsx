interface RecordDetailProps {
	label: string;
	value: string;
}

export function RecordDetail({ label, value }: RecordDetailProps) {
	return (
		<div className="grid min-w-0 gap-2 sm:grid-cols-2 sm:items-baseline">
			<span className="text-xs text-muted-foreground sm:text-sm">{label}</span>
			<span className="break-words text-sm font-medium sm:text-right sm:text-base">
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
			<p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
			<p className="text-base font-semibold">{value}</p>
		</div>
	);
}
