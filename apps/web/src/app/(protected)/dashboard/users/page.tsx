import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { buttonVariants } from "@/components/ui/button";
import { UsersTable } from "@/components/users/users-table";
import { usersControllerFindAll } from "@/lib/api/users";
import { usersBreadcrumbs } from "./breadcrumbs";

export default async function Page() {
	const users = await usersControllerFindAll();

	return (
		<>
			<Breadcrumbs items={usersBreadcrumbs.home()} />

			<PageHeader
				title="Users"
				description="Manage operational accounts, roles, and user permissions."
			>
				<Link className={buttonVariants()} href="/dashboard/users/new">
					<PlusIcon />
					Create User
				</Link>
			</PageHeader>

			<UsersTable data={users} />
		</>
	);
}
