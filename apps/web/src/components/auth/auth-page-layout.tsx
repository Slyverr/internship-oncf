"use client";

import { CheckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { AuthThemeSelector } from "./auth-theme-selector";

function OncfLogo({ t }: { t: ReturnType<typeof useTranslate> }) {
	return (
		<span className="relative block h-10 w-24 shrink-0 overflow-hidden">
			<Image
				src="/oncf.png"
				alt={t(Messages.auth.brand.logoAlt)}
				fill
				priority
				sizes="96px"
				className="object-cover object-[center_43%]"
			/>
		</span>
	);
}

function BrandHeader({ t }: { t: ReturnType<typeof useTranslate> }) {
	return (
		<div className="flex items-center gap-2 xl:gap-4">
			<OncfLogo t={t} />
			<span className="grid gap-compact border-l border-border pl-2 xl:pl-4">
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
	const workspaceAreas = [
		{
			label: t(Messages.navigation.orders),
			description: t(Messages.auth.brand.areas.orders),
		},
		{
			label: t(Messages.navigation.programs),
			description: t(Messages.auth.brand.areas.programs),
		},
		{
			label: t(Messages.navigation.claims),
			description: t(Messages.auth.brand.areas.claims),
		},
		{
			label: t(Messages.navigation.reports),
			description: t(Messages.auth.brand.areas.tracking),
		},
	];
	return (
		<main className="oncf-auth-page">
			<div className="oncf-auth-shell">
				<aside aria-labelledby="auth-brand-heading" className="oncf-auth-brand">
					<BrandHeader t={t} />
					<div className="grid gap-4">
						<p className="text-sm font-semibold uppercase tracking-[0.12em] text-sidebar-primary">
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
						<ul aria-labelledby="auth-brand-heading" className="grid gap-4">
							{workspaceAreas.map(({ label, description }) => (
								<li
									key={label}
									className="flex min-w-0 items-start gap-control"
								>
									<CheckIcon
										aria-hidden="true"
										className="mt-1 size-4 shrink-0 text-sidebar-primary"
									/>
									<span className="grid min-w-0 gap-compact">
										<span className="text-sm font-medium">{label}</span>
										<span className="text-sm text-muted-foreground">
											{description}
										</span>
									</span>
								</li>
							))}
						</ul>
					</div>
					<p className="border-t border-border/70 pt-4 text-sm text-muted-foreground">
						{t(Messages.auth.brand.footer)}
					</p>
				</aside>

				<section className="oncf-auth-content">
					<header className="oncf-auth-toolbar">
						<Link
							href="/login"
							aria-label={t(Messages.auth.login.brandLink)}
							className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
						>
							<BrandHeader t={t} />
						</Link>
						<AuthThemeSelector />
					</header>

					<div className="oncf-auth-form-region page-enter">{children}</div>
				</section>
			</div>
		</main>
	);
}
