import type { Metadata } from "next";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.settings.dialogTitle),
	};
}

export default function InterceptedSettingsPage() {
	return <SettingsDialog />;
}
