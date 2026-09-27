import Link from "next/link";
import type { ReactNode } from "react";

export function TableRowLink({
	href,
	children,
}: {
	href: string;
	children: ReactNode;
}) {
	return (
		<Link
			href={href}
			className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			onClick={(event) => event.stopPropagation()}
		>
			{children}
		</Link>
	);
}
