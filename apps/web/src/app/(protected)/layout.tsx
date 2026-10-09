import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/actions/auth";
import { AppearancePreferencesSync } from "@/providers/appearance-preferences-sync";
import { AuthProvider } from "@/providers/auth-provider";
import { RealtimeProvider } from "@/providers/realtime-provider";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const profile = await getCurrentProfile();
	if (!profile) {
		redirect("/login");
	}

	return (
		<AuthProvider profile={profile}>
			<RealtimeProvider>
				<AppearancePreferencesSync>{children}</AppearancePreferencesSync>
			</RealtimeProvider>
		</AuthProvider>
	);
}
