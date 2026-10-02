import * as React from "react";

import { controlSurfaceClasses } from "@/components/ui/control-styles";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"flex field-sizing-content min-h-16 w-full px-field py-2 text-base placeholder:text-muted-foreground md:text-sm",
				controlSurfaceClasses,
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
