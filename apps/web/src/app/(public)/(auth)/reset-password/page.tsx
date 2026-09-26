import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
	title: "Reset password",
	description: "Set a new password for your ECommand account.",
};

interface PageProps {
	searchParams: Promise<{ token?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
	const { token = "" } = await searchParams;
	return <ResetPasswordForm token={token} />;
}
