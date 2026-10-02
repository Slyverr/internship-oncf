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
		<div className="grid justify-items-start gap-1">
			<Label htmlFor={htmlFor} className={error ? "text-destructive" : ""}>
				{label} {required ? "*" : ""}
			</Label>
			{error ? (
				<span
					role="alert"
					className="inline-flex w-full min-w-0 items-start gap-compact break-words text-meta font-medium text-destructive"
				>
					<AlertCircle className="mt-0.5 size-3 shrink-0" />
					{error}
				</span>
			) : null}
		</div>
	);
}
