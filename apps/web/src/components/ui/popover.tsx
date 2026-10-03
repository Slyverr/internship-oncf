"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

function PopoverTrigger({
	className,
	...props
}: PopoverPrimitive.Trigger.Props) {
	return (
		<PopoverPrimitive.Trigger
			data-slot="popover-trigger"
			className={cn(className)}
			{...props}
		/>
	);
}

function PopoverContent({
	className,
	side = "bottom",
	sideOffset = 8,
	align = "end",
	alignOffset = 0,
	...props
}: PopoverPrimitive.Popup.Props &
	Pick<
		PopoverPrimitive.Positioner.Props,
		"side" | "sideOffset" | "align" | "alignOffset"
	>) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Positioner
				data-slot="popover-positioner"
				className="isolate z-[120]"
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
			>
				<PopoverPrimitive.Popup
					data-slot="popover-content"
					className={cn(
						"max-h-[min(var(--available-height),24rem)] min-w-52 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg oncf-popover-surface p-4 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						className,
					)}
					{...props}
				/>
			</PopoverPrimitive.Positioner>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverContent, PopoverTrigger };
