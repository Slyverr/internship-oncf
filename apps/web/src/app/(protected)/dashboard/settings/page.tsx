import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { SettingsDialog } from "@/components/settings/settings-dialog";

export default function Page() {
	return (
		<>
			<DashboardHome />
			<SettingsDialog closeToDashboard />
		</>
	);
}
