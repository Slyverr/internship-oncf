import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { roleProfileCreateBreadcrumbs } from "@/components/roles/breadcrumbs";
import { RoleProfilesPage } from "@/components/roles/role-profiles-page";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return { title: t(Messages.roleProfiles.createTitle) };
}

export default async function Page() {
	const t = await getRequestTranslator();
	return (
		<>
			<Breadcrumbs items={roleProfileCreateBreadcrumbs(t)} />
			<RoleProfilesPage mode="create" />
		</>
	);
}
