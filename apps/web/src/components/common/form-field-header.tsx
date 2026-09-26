import { AlertCircle } from "lucide-react";

import { Label } from "@/components/ui/label";

type FormFieldHeaderProps = {
	htmlFor: string;
	label: string;
	required?: boolean;
	error?: string;
};

export function FormFieldHeader({
	htmlFor,
	label,
	required,
	error,
}: FormFieldHeaderProps) {
	return (
		<div className="flex items-center justify-between gap-4">
			<Label htmlFor={htmlFor} className={error ? "text-destructive" : ""}>
				{label} {required ? "*" : ""}
			</Label>
			{error ? (
				<span
					role="alert"
					className="inline-flex items-center gap-compact text-xs font-medium text-destructive"
				>
					<AlertCircle className="h-3.5 w-3.5 shrink-0" />
					{error}
				</span>
			) : null}
		</div>
	);
}
