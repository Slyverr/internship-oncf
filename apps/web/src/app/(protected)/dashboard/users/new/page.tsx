import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UserCreateForm } from "@/components/users/user-create-form";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { usersBreadcrumbs } from "../breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.users.createTitle),
	};
}

export default async function Page() {
	const t = await getRequestTranslator();
	return (
		<>
			<Breadcrumbs items={usersBreadcrumbs.create(t)} />
			<UserCreateForm />
		</>
	);
}
