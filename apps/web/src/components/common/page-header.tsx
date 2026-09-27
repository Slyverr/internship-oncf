import type { ReactNode } from "react";

interface PageHeaderProps {
	title: string;
	description?: string;
	children?: ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
	return (
		<header className="flex min-w-0 flex-col gap-4 @5xl/workspace:flex-row @5xl/workspace:items-start @5xl/workspace:justify-between">
			<div className="min-w-0 space-y-2">
				<h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
					{title}
				</h1>
				{description && (
					<p className="max-w-3xl text-sm leading-6 text-muted-foreground">
						{description}
					</p>
				)}
			</div>
			{children && (
				<div className="flex flex-wrap items-center gap-4">{children}</div>
			)}
		</header>
	);
}
