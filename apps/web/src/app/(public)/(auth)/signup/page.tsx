import { Metadata } from "next";
import { ClientRegistrationForm } from "@/components/auth/client-registration-form";

export const metadata: Metadata = {
	title: "Sign Up",
	description: "Request access to ECommand using your company details.",
};

export default function Page() {
	return <ClientRegistrationForm />;
}
