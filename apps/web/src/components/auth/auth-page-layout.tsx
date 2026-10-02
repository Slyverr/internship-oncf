"use client";

import { CheckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { AuthThemeSelector } from "./auth-theme-selector";

function OncfLogo({
	large = false,
	t,
}: {
	large?: boolean;
	t: ReturnType<typeof useTranslate>;
}) {
	return (
		<span
			className={`relative block shrink-0 overflow-hidden ${large ? "h-14 w-32" : "h-11 w-24"}`}
		>
			<Image
				src="/oncf.png"
				alt={t(Messages.auth.brand.logoAlt)}
				fill
				priority
				sizes={large ? "128px" : "96px"}
				className="object-cover object-[center_40%]"
			/>
		</span>
	);
}

function BrandHeader({
	large = false,
	t,
}: {
	large?: boolean;
	t: ReturnType<typeof useTranslate>;
}) {
	return (
		<div className="flex items-center gap-4">
			<OncfLogo large={large} t={t} />
			<span className="grid gap-compact border-l border-border pl-4">
				<span className="text-sm font-semibold tracking-tight">
					{t(Messages.auth.brand.name)}
				</span>
				<span className="text-xs text-muted-foreground">
					{t(Messages.auth.brand.strapline)}
				</span>
			</span>
		</div>
	);
}

export function AuthPageLayout({ children }: { children: ReactNode }) {
	const t = useTranslate();
	const workspaceHighlights = [
		t(Messages.auth.brand.highlights.orders),
		t(Messages.auth.brand.highlights.programs),
		t(Messages.auth.brand.highlights.claims),
	];

	return (
		<main className="grid min-h-svh place-items-start bg-background p-4 sm:place-items-center sm:p-6">
			<div className="grid w-full max-w-3xl xl:auth-shell-height xl:max-w-6xl xl:grid-cols-2">
				<aside
					aria-labelledby="auth-brand-heading"
					className="hidden flex-col justify-between bg-sidebar p-8 text-sidebar-foreground xl:flex xl:p-12"
				>
					<BrandHeader large t={t} />
					<div className="grid gap-8">
						<div className="grid max-w-xl gap-4">
							<p className="text-sm font-medium text-sidebar-primary">
								{t(Messages.auth.brand.category)}
							</p>
							<h2
								id="auth-brand-heading"
								className="text-4xl font-semibold leading-tight tracking-tight"
							>
								{t(Messages.auth.brand.headline)}
							</h2>
							<p className="max-w-lg text-base leading-7 text-muted-foreground">
								{t(Messages.auth.brand.description)}
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
						{t(Messages.auth.brand.footer)}
					</p>
				</aside>

				<section className="relative flex min-w-0 flex-col justify-center gap-6 p-4 sm:p-8 xl:p-12">
					<header className="flex w-full items-center justify-between xl:absolute xl:top-4 xl:right-4 xl:w-auto">
						<Link
							href="/login"
							aria-label={t(Messages.auth.login.brandLink)}
							className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
						>
							<BrandHeader t={t} />
						</Link>
						<AuthThemeSelector />
					</header>

					<div className="page-enter w-full">{children}</div>
				</section>
			</div>
		</main>
	);
}
