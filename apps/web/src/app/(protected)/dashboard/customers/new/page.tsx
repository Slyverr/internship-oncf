import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CustomerCreateForm } from "@/components/customers/customer-create-form";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { customersBreadcrumbs } from "../breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.customers.createTitle),
	};
}

export default async function Page() {
	const t = await getRequestTranslator();
	return (
		<>
			<Breadcrumbs items={customersBreadcrumbs.create(t)} />
			<CustomerCreateForm />
		</>
	);
}
