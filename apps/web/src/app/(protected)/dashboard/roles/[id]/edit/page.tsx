import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { roleProfileEditBreadcrumbs } from "@/components/roles/breadcrumbs";
import { RoleProfilesPage } from "@/components/roles/role-profiles-page";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return { title: t(Messages.roleProfiles.editTitle) };
}

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [{ id }, t] = await Promise.all([params, getRequestTranslator()]);
	return (
		<>
			<Breadcrumbs items={roleProfileEditBreadcrumbs(t)} />
			<RoleProfilesPage mode="edit" profileId={id} />
		</>
	);
}
