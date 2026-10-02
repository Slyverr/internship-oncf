import { Metadata } from "next";
import { ClientRegistrationForm } from "@/components/auth/client-registration-form";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.auth.signup.title),
		description: t(Messages.auth.signup.description),
	};
}

export default function Page() {
	return <ClientRegistrationForm />;
}
