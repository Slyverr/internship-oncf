import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import { Messages, translate } from "@/i18n";
import { getRequestLocale } from "@/i18n/server";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getRequestLocale();
	return {
		title: {
			default: translate(Messages.common.metadata.title, {}, locale),
			template: translate(Messages.common.metadata.template, {}, locale),
		},
		description: translate(Messages.common.metadata.description, {}, locale),
		icons: {
			icon: "/oncf.png",
		},
	};
}

export default async function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getRequestLocale();
	return (
		<html
			lang={locale}
			suppressHydrationWarning
			className={cn(
				"h-full",
				"antialiased",
				geistSans.variable,
				geistMono.variable,
				"font-sans",
				inter.variable,
			)}
		>
			<body className="min-h-full flex flex-col">
				<Script src="/theme-init.js" strategy="beforeInteractive" />
				<Providers locale={locale}>{children}</Providers>
			</body>
		</html>
	);
}
