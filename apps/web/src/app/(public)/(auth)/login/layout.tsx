import type { Metadata } from "next";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return { title: t(Messages.auth.login.pageTitle) };
}

export default function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <>{children}</>;
}
