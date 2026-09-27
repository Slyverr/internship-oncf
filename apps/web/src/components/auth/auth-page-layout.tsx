import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

function OncfLogo({ inverse = false }: { inverse?: boolean }) {
	return (
		<span className="relative block h-12 w-28 shrink-0 overflow-hidden sm:h-14 sm:w-32">
			<Image
				src="/oncf.png"
				alt="ONCF"
				fill
				priority
				sizes="128px"
				className={
					"object-cover object-[center_40%] " +
					(inverse ? "brightness-0 invert" : "")
				}
			/>
		</span>
	);
}

export function AuthPageLayout({ children }: { children: ReactNode }) {
	return (
		<main className="min-h-svh bg-background">
			<div className="grid min-h-svh lg:grid-cols-2">
				<section className="flex min-h-svh flex-col gap-8 px-4 py-8 sm:px-8 lg:px-12 xl:px-20">
					<header className="mx-auto flex w-full max-w-lg items-center gap-3 lg:hidden">
						<Link
							href="/login"
							aria-label="ECommand sign in"
							className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<OncfLogo />
						</Link>
						<span className="border-l border-border pl-3 text-sm font-semibold tracking-tight">
							ECommand
						</span>
					</header>
					<div className="mx-auto flex w-full max-w-lg flex-1 items-center">
						{children}
					</div>
					<footer className="mx-auto w-full max-w-lg text-center text-xs text-muted-foreground lg:text-left">
						ECommand · ONCF freight operations
					</footer>
				</section>

				<aside className="hidden min-h-svh p-6 lg:flex xl:p-10">
					<div className="relative isolate flex flex-1 flex-col justify-between overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground xl:p-12 2xl:p-16">
						<div
							aria-hidden="true"
							className="absolute -right-16 -bottom-16 size-96 rounded-full border border-primary-foreground/10"
						/>
						<div
							aria-hidden="true"
							className="absolute -right-8 -bottom-8 size-64 rounded-full border border-primary-foreground/10"
						/>
						<div className="relative">
							<Link
								href="/login"
								aria-label="ECommand sign in"
								className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
							>
								<OncfLogo inverse />
							</Link>
						</div>
						<div className="relative grid max-w-2xl gap-6">
							<p className="text-sm font-medium uppercase tracking-[0.16em] text-primary-foreground/75">
								Freight workspace
							</p>
							<h1 className="text-4xl leading-tight font-semibold tracking-tight xl:text-5xl 2xl:text-6xl">
								Keep freight operations moving.
							</h1>
							<p className="max-w-xl text-base leading-relaxed text-primary-foreground/80 xl:text-lg">
								Manage orders, forecast programs, and customer claims from one
								connected workspace.
							</p>
							<div className="flex flex-wrap gap-3 pt-2 text-sm font-medium">
								{["Orders", "Programs", "Claims"].map((item) => (
									<span
										key={item}
										className="rounded-full border border-primary-foreground/25 px-4 py-2"
									>
										{item}
									</span>
								))}
							</div>
						</div>
						<p className="relative text-xs text-primary-foreground/70">
							An operational portal for ONCF freight teams.
						</p>
					</div>
				</aside>
			</div>
		</main>
	);
}
