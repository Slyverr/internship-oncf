import { RegistrationStatus, Role } from "@ecommand/shared";
import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { buttonVariants } from "@/components/ui/button";
import { UsersTable } from "@/components/users/users-table";
import { Messages } from "@/i18n";
import { getRequestTranslator } from "@/i18n/server";
import { usersControllerFindAll } from "@/lib/api/users";
import { usersBreadcrumbs } from "./breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getRequestTranslator();
	return {
		title: t(Messages.users.pageTitle),
	};
}

interface PageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
	const t = await getRequestTranslator();
	const query = await searchParams;
	const registrationStatus = Object.values(RegistrationStatus).find(
		(value) => value === query.registrationStatus,
	);
	const role = Object.values(Role).find((value) => value === query.role);
	const activeStatus =
		query.activeStatus === "ACTIVE" || query.activeStatus === "INACTIVE"
			? query.activeStatus
			: undefined;
	const search = typeof query.search === "string" ? query.search : undefined;
	const users = await usersControllerFindAll();
	const pendingRegistrations = users.filter(
		(user) => user.registrationStatus === RegistrationStatus.PENDING,
	).length;

	return (
		<>
			<Breadcrumbs items={usersBreadcrumbs.home(t)} />

			<PageHeader
				title={t(Messages.users.pageTitle)}
				description={
					pendingRegistrations > 0
						? t(Messages.users.pendingCount, {
								count: pendingRegistrations,
							})
						: t(Messages.users.manageDescription)
				}
			>
				<Link className={buttonVariants()} href="/dashboard/users/new">
					<PlusIcon />
					{t(Messages.users.create)}
				</Link>
			</PageHeader>

			<UsersTable
				data={users}
				registrationStatus={registrationStatus}
				role={role}
				activeStatus={activeStatus}
				search={search}
			/>
		</>
	);
}
