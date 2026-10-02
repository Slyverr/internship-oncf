import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.auth.recovery.resetPageTitle),
		description: t(Messages.auth.recovery.resetPageDescription),
	};
}

interface PageProps {
	searchParams: Promise<{ token?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
	const { token = "" } = await searchParams;
	return <ResetPasswordForm token={token} />;
}
