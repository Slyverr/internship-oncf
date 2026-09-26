import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { SettingsPanel } from "@/components/settings/settings-panel";

export default function Page() {
	return (
		<>
			<Breadcrumbs items={[{ label: "Settings" }]} />
			<PageHeader
				title="Settings"
				description="Personalize your workspace and manage your account."
			/>
			<SettingsPanel />
		</>
	);
}
