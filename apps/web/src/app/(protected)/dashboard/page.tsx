import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard/dashboard-home";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Recent order, program, and claim activity.",
};

export default function Page() {
	return <DashboardHome />;
}
