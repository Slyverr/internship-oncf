import { CheckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthThemeSelector } from "./auth-theme-selector";

function OncfLogo({ large = false }: { large?: boolean }) {
	return (
		<span
			className={`relative block shrink-0 overflow-hidden ${large ? "h-14 w-32" : "h-11 w-24"}`}
		>
			<Image
				src="/oncf.png"
				alt="ONCF"
				fill
				priority
				sizes={large ? "128px" : "96px"}
				className="object-cover object-[center_40%]"
			/>
		</span>
	);
}

function BrandHeader({ large = false }: { large?: boolean }) {
	return (
		<div className="flex items-center gap-4">
			<OncfLogo large={large} />
			<span className="grid gap-compact border-l border-border pl-4">
				<span className="text-sm font-semibold tracking-tight">ECommand</span>
				<span className="text-xs text-muted-foreground">
					Freight operations
				</span>
			</span>
		</div>
	);
}

const workspaceHighlights = [
	"Keep customer orders and their context together.",
	"Link eligible orders directly to forecast programs.",
	"Follow freight progress and manage claims in one workspace.",
];

export function AuthPageLayout({ children }: { children: ReactNode }) {
	return (
		<main className="grid min-h-svh place-items-start bg-background p-4 sm:place-items-center sm:p-6">
			<div className="grid w-full max-w-3xl xl:auth-shell-height xl:max-w-6xl xl:grid-cols-2">
				<aside
					aria-labelledby="auth-brand-heading"
					className="hidden flex-col justify-between bg-sidebar p-8 text-sidebar-foreground xl:flex xl:p-12"
				>
					<BrandHeader large />
					<div className="grid gap-8">
						<div className="grid max-w-xl gap-4">
							<p className="text-sm font-medium text-sidebar-primary">
								ONCF freight operations
							</p>
							<h2
								id="auth-brand-heading"
								className="text-4xl font-semibold leading-tight tracking-tight"
							>
								Keep freight work moving.
							</h2>
							<p className="max-w-lg text-base leading-7 text-muted-foreground">
								Bring orders, forecast programs, claims, and tracking into one
								clear operational workspace.
							</p>
						</div>
						<ul className="grid max-w-xl gap-4">
							{workspaceHighlights.map((highlight) => (
								<li key={highlight} className="flex items-center gap-3 text-sm">
									<span className="grid size-8 shrink-0 place-items-center rounded-full bg-sidebar-primary/10 text-sidebar-primary">
										<CheckIcon aria-hidden="true" className="size-4" />
									</span>
									<span className="text-muted-foreground">{highlight}</span>
								</li>
							))}
						</ul>
					</div>
					<p className="text-sm text-muted-foreground">
						A shared workspace for the teams behind every shipment.
					</p>
				</aside>

				<section className="relative flex min-w-0 flex-col justify-center gap-6 p-4 sm:p-8 xl:p-12">
					<header className="flex w-full items-center justify-between xl:absolute xl:top-4 xl:right-4 xl:w-auto">
						<Link
							href="/login"
							aria-label="ECommand sign in"
							className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
						>
							<BrandHeader />
						</Link>
						<AuthThemeSelector />
					</header>

					<div className="page-enter w-full">{children}</div>
				</section>
			</div>
		</main>
	);
}
