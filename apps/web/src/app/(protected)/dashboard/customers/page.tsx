import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AccessDeniedState } from "@/components/common/access-denied-state";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { CustomersTable } from "@/components/customers/customers-table";
import { buttonVariants } from "@/components/ui/button";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { customersControllerFindAll } from "@/lib/api/customers";
import type { CustomersControllerFindAllParams } from "@/lib/api/generated.schemas";
import { loadPageData } from "@/lib/load-page-data";
import { customersBreadcrumbs } from "./breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.customers.pageTitle),
		description: t(Messages.customers.pageDescription),
	};
}

interface PageProps {
	searchParams: Promise<CustomersControllerFindAllParams>;
}

export default async function Page({ searchParams }: PageProps) {
	const t = await getRequestTranslator();
	const query = await searchParams;
	const customers = await loadPageData(customersControllerFindAll(query));
	if (!customers) {
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
			<Breadcrumbs items={customersBreadcrumbs.home(t)} />

			<PageHeader
				title={t(Messages.customers.pageTitle)}
				description={t(Messages.customers.pageDescription)}
			>
				<Link className={buttonVariants()} href="/dashboard/customers/new">
					<PlusIcon />
					{t(Messages.customers.create)}
				</Link>
			</PageHeader>

			<CustomersTable data={customers} />
		</>
	);
}
