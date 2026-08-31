import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/actions/auth";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const user = await getCurrentProfile();
	if (user) redirect("/dashboard");

	return <>{children}</>;
}
