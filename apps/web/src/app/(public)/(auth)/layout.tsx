import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const user = await getCurrentUser();
	if (user) redirect("/dashboard");

	return <>{children}</>;
}
