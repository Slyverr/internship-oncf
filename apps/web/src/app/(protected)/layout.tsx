import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/actions/auth";
import { AuthProvider } from "@/providers/auth-provider";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const profile = await getCurrentProfile();
	if (!profile) {
		redirect("/login");
	}

	return <AuthProvider profile={profile}>{children}</AuthProvider>;
}
