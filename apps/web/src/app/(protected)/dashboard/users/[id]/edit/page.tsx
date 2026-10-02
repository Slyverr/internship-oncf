import type { Metadata } from "next";
import { AccessDeniedState } from "@/components/common/access-denied-state";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UserEditForm } from "@/components/users/user-edit-form";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { usersControllerFindOne } from "@/lib/api/users";
import { loadPageData } from "@/lib/load-page-data";
import { usersBreadcrumbs } from "../../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.users.editTitle),
	};
}

export default async function Page({ params }: PageProps) {
	const t = await getRequestTranslator();
	const { id } = await params;
	const user = await loadPageData(usersControllerFindOne(Number(id)));
	if (!user) {
		return (
			<AccessDeniedState
				title={t(Messages.users.pageTitle)}
				description={t(Messages.apiError.accessDenied)}
				breadcrumbs={usersBreadcrumbs.home(t)}
			/>
		);
	}

	return (
		<>
			<Breadcrumbs
				items={usersBreadcrumbs.edit(
					id,
					`${user.firstName} ${user.lastName}`,
					t,
				)}
			/>
			<UserEditForm user={user} />
		</>
	);
}
