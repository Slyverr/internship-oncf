import Link from "next/link";

export function SidebarLogo() {
	return (
		<div className="flex items-center justify-center py-4">
			<Link
				href="/dashboard"
				className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
			>
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
					<span className="text-lg font-bold">L</span>
				</div>

				<span className="text-xl font-bold group-data-[collapsible=icon]:hidden">
					Logo
				</span>
			</Link>
		</div>
	);
}
