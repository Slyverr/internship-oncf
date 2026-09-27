import { TableCell, TableRow } from "@/components/ui/table";

export function TableEmptyStateRow({
	colSpan,
	message,
}: {
	colSpan: number;
	message: string;
}) {
	return (
		<TableRow>
			<TableCell colSpan={colSpan} className="py-8 text-center">
				{message}
			</TableCell>
		</TableRow>
	);
}
