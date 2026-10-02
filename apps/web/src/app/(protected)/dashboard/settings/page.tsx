import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.settings.dialogTitle),
	};
}

export default function Page() {
	return (
		<>
			<DashboardHome />
			<SettingsDialog closeToDashboard />
		</>
	);
}
