// biome-ignore-all lint/a11y/noLabelWithoutControl: This generic label primitive forwards association props supplied by each use site.

"use client";

import * as React from "react";

import { RequiredMark } from "@/components/common/required-mark";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<"label"> & { required?: boolean };

function Label({ className, required, children, ...props }: LabelProps) {
	return (
		<label
			data-slot="label"
			className={cn(
				"flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:text-muted-foreground",
				className,
			)}
			{...props}
		>
			{children}
			{required ? <RequiredMark /> : null}
		</label>
	);
}

export { Label };
