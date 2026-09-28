import { RegistrationStatus, Role } from "@ecommand/shared";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { buttonVariants } from "@/components/ui/button";
import { UsersTable } from "@/components/users/users-table";
import { usersControllerFindAll } from "@/lib/api/users";
import { usersBreadcrumbs } from "./breadcrumbs";

interface PageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
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
			<Breadcrumbs items={usersBreadcrumbs.home()} />

			<PageHeader
				title="Users"
				description={
					pendingRegistrations > 0
						? `${pendingRegistrations} client access ${pendingRegistrations === 1 ? "request is" : "requests are"} awaiting review.`
						: "Manage operational accounts, roles, and user permissions."
				}
			>
				<Link className={buttonVariants()} href="/dashboard/users/new">
					<PlusIcon />
					Create User
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
