import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

function OncfLogo() {
	return (
		<span className="relative block h-10 w-24 shrink-0 overflow-hidden">
			<Image
				src="/oncf.png"
				alt="ONCF"
				fill
				priority
				sizes="96px"
				className="object-cover object-[center_40%]"
			/>
		</span>
	);
}

export function AuthPageLayout({ children }: { children: ReactNode }) {
	return (
		<main className="grid min-h-svh place-items-center bg-background px-4 py-8 sm:px-6 sm:py-12">
			<div className="grid w-full max-w-2xl justify-items-center gap-6">
				<header className="flex items-center gap-3">
					<Link
						href="/login"
						aria-label="ECommand sign in"
						className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<OncfLogo />
					</Link>
					<span className="border-l border-border pl-3">
						<span className="block text-sm font-semibold tracking-tight">
							ECommand
						</span>
						<span className="block text-xs text-muted-foreground">
							Freight operations
						</span>
					</span>
				</header>

				{children}

				<footer className="text-center text-xs text-muted-foreground">
					ONCF freight operations
				</footer>
			</div>
		</main>
	);
}
