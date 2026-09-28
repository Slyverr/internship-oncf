"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
	const scrollAreaRef = React.useRef<HTMLDivElement>(null);
	const tableRef = React.useRef<HTMLTableElement>(null);
	const hintId = React.useId();
	const [hasHorizontalOverflow, setHasHorizontalOverflow] =
		React.useState(false);
	const [canScrollFurther, setCanScrollFurther] = React.useState(false);

	React.useEffect(() => {
		const scrollArea = scrollAreaRef.current;
		const table = tableRef.current;

		if (!scrollArea || !table) {
			return;
		}

		const updateScrollHint = () => {
			const hasOverflow = table.scrollWidth > scrollArea.clientWidth + 1;
			const canScrollRight =
				hasOverflow &&
				scrollArea.scrollLeft <
					scrollArea.scrollWidth - scrollArea.clientWidth - 1;

			setHasHorizontalOverflow((current) =>
				current === hasOverflow ? current : hasOverflow,
			);
			setCanScrollFurther((current) =>
				current === canScrollRight ? current : canScrollRight,
			);
		};

		updateScrollHint();

		const resizeObserver = new ResizeObserver(updateScrollHint);
		resizeObserver.observe(scrollArea);
		resizeObserver.observe(table);
		scrollArea.addEventListener("scroll", updateScrollHint, { passive: true });

		return () => {
			resizeObserver.disconnect();
			scrollArea.removeEventListener("scroll", updateScrollHint);
		};
	}, []);

	return (
		<div data-slot="table-container" className="w-full min-w-0">
			{hasHorizontalOverflow && canScrollFurther && (
				<div
					id={hintId}
					className="flex items-center gap-control border-b px-control py-control text-xs text-muted-foreground"
				>
					<span aria-hidden="true">↔</span>
					<span>Scroll to see the remaining columns</span>
				</div>
			)}
			<section
				ref={scrollAreaRef}
				aria-label="Scrollable table content"
				aria-describedby={
					hasHorizontalOverflow && canScrollFurther ? hintId : undefined
				}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: the scroll region needs keyboard focus when its table overflows
				tabIndex={0}
				className="@container/table w-full min-w-0 overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
			>
				<table
					ref={tableRef}
					data-slot="table"
					className={cn("w-full caption-bottom text-sm", className)}
					{...props}
				/>
			</section>
		</div>
	);
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
	return (
		<thead
			data-slot="table-header"
			className={cn("[&_tr]:border-b", className)}
			{...props}
		/>
	);
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
	return (
		<tbody
			data-slot="table-body"
			className={cn("[&_tr]:h-14 [&_tr:last-child]:border-0", className)}
			{...props}
		/>
	);
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
	return (
		<tfoot
			data-slot="table-footer"
			className={cn(
				"border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
				className,
			)}
			{...props}
		/>
	);
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
	return (
		<tr
			data-slot="table-row"
			className={cn(
				"border-b transition-colors hover:bg-muted/30 has-aria-expanded:bg-muted/30 data-[state=selected]:bg-muted",
				className,
			)}
			{...props}
		/>
	);
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
	return (
		<th
			data-slot="table-head"
			className={cn(
				"h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0",
				className,
			)}
			{...props}
		/>
	);
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
	return (
		<td
			data-slot="table-cell"
			className={cn(
				"px-4 py-compact align-middle text-sm leading-5 whitespace-nowrap [&:has([role=checkbox])]:pr-0",
				className,
			)}
			{...props}
		/>
	);
}

function TableCaption({
	className,
	...props
}: React.ComponentProps<"caption">) {
	return (
		<caption
			data-slot="table-caption"
			className={cn("pt-4 text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

export {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
};
