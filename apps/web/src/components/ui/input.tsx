import { Input as InputPrimitive } from "@base-ui/react/input";
import * as React from "react";

import { controlSurfaceClasses } from "@/components/ui/control-styles";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(
				"h-11 w-full min-w-0 px-field py-2 text-base file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none md:text-sm",
				controlSurfaceClasses,
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
