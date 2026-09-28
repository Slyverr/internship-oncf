import type { ReactNode } from "react";
import { TableCell, TableRow } from "@/components/ui/table";

export function TableEmptyStateRow({
	colSpan,
	message,
	description,
	action,
}: {
	colSpan: number;
	message: ReactNode;
	description?: ReactNode;
	action?: ReactNode;
}) {
	return (
		<TableRow>
			<TableCell
				colSpan={colSpan}
				className="py-8! text-left whitespace-normal sm:text-center"
			>
				<div className="mx-0 grid w-[calc(100cqw-2rem)] max-w-xl justify-items-start gap-2 @5xl/table:mx-auto @5xl/table:w-full @5xl/table:justify-items-center">
					<p className="text-sm font-medium text-foreground">{message}</p>
					{description && (
						<p className="text-sm text-muted-foreground">{description}</p>
					)}
					{action && <div className="pt-compact">{action}</div>}
				</div>
			</TableCell>
		</TableRow>
	);
}
