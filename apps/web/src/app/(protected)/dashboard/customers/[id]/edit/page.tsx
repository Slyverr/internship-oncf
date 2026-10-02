import type { Metadata } from "next";
import { AccessDeniedState } from "@/components/common/access-denied-state";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { CustomerEditForm } from "@/components/customers/customer-edit-form";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { customersControllerFindOne } from "@/lib/api/customers";
import { loadPageData } from "@/lib/load-page-data";
import { customersBreadcrumbs } from "../../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.customers.editTitle),
	};
}

export default async function Page({ params }: PageProps) {
	const t = await getRequestTranslator();
	const { id } = await params;
	const customer = await loadPageData(customersControllerFindOne(Number(id)));
	if (!customer) {
		return (
			<AccessDeniedState
				title={t(Messages.customers.pageTitle)}
				description={t(Messages.apiError.accessDenied)}
				breadcrumbs={customersBreadcrumbs.home(t)}
			/>
		);
	}

	return (
		<>
			<Breadcrumbs
				items={customersBreadcrumbs.edit(id, customer.companyName, t)}
			/>
			<CustomerEditForm customer={customer} />
		</>
	);
}
