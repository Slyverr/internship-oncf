import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
	title: "Forgot Password",
	description: "",
};

export default function Page() {
	return <ForgotPasswordForm />;
}
