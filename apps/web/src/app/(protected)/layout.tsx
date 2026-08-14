import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { AuthProvider } from "@/providers/auth-provider";

export default async function Layout({ children }: Readonly<{ children: React.ReactNode; }>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

	return (
    <AuthProvider user={user}>
      { children }
    </AuthProvider>
  );
}
