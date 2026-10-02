import type { Metadata } from "next";
import { ClaimCreateForm } from "@/components/claims/claim-create-form";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { claimsBreadcrumbs } from "../breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.claims.newTitle),
	};
}

export default async function Page() {
	const t = await getRequestTranslator();
	return (
		<>
			<Breadcrumbs items={claimsBreadcrumbs.create(t)} />

			<ClaimCreateForm />
		</>
	);
}
