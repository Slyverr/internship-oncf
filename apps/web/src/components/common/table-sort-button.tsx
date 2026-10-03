import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";

type SortDirection = false | "asc" | "desc" | undefined;

interface TableSortButtonProps {
	children: ReactNode;
	sorted: SortDirection;
	onClick?: MouseEventHandler<HTMLButtonElement>;
	canSort?: boolean;
}

export function TableSortButton({
	children,
	sorted,
	onClick,
	canSort = true,
}: TableSortButtonProps) {
	const t = useTranslate();
	const isSorted = sorted === "asc" || sorted === "desc";
	const iconTone = canSort
		? isSorted
			? "text-primary"
			: "text-foreground/65"
		: "text-foreground/30";

	return (
		<button
			type="button"
			disabled={!canSort}
			onClick={onClick}
			className={`flex w-full items-center gap-2 text-left ${isSorted ? "font-semibold text-primary" : ""} ${canSort ? "cursor-pointer" : "cursor-default"}`}
		>
			{children}
			{isSorted && (
				<span className="sr-only">
					{t(
						sorted === "asc"
							? Messages.common.accessibility.sortedAscending
							: Messages.common.accessibility.sortedDescending,
					)}
				</span>
			)}
			<span
				aria-hidden="true"
				className={`inline-flex shrink-0 flex-col items-center justify-center -space-y-1 ${iconTone}`}
			>
				<ChevronUpIcon
					className={`size-3 ${sorted === "asc" ? "opacity-100" : "opacity-75"}`}
					strokeWidth={sorted === "asc" ? 2.5 : 1.75}
				/>
				<ChevronDownIcon
					className={`size-3 ${sorted === "desc" ? "opacity-100" : "opacity-75"}`}
					strokeWidth={sorted === "desc" ? 2.5 : 1.75}
				/>
			</span>
		</button>
	);
}
