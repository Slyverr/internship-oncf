import Link from "next/link";
import { Fragment } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbItem as BreadcrumbItemData } from "@/providers/breadcrumb-provider";

export function BreadcrumbTrail({
	items,
	className,
}: {
	items: BreadcrumbItemData[];
	className?: string;
}) {
	if (items.length === 0) return null;

	return (
		<Breadcrumb className={`min-w-0 overflow-hidden ${className ?? ""}`}>
			<BreadcrumbList className="min-w-0 flex-nowrap gap-control overflow-hidden">
				{items.map((breadcrumb, index) => {
					const isLast = index === items.length - 1;
					const key = `${breadcrumb.href ?? "current"}-${breadcrumb.label}`;

					return (
						<Fragment key={key}>
							<BreadcrumbItem
								className={
									index < items.length - 1 ? "hidden sm:inline-flex" : "min-w-0"
								}
							>
								{isLast || !breadcrumb.href ? (
									<BreadcrumbPage className="block max-w-64 truncate">
										{breadcrumb.label}
									</BreadcrumbPage>
								) : (
									<BreadcrumbLink render={<Link href={breadcrumb.href} />}>
										{breadcrumb.label}
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>

							{!isLast && <BreadcrumbSeparator className="hidden sm:block" />}
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
