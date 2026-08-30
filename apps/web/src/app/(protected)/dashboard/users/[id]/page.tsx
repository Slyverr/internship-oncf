import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UserDetailsClient } from "@/components/users/user-details-client";
import { usersControllerFindOne } from "@/lib/api/users";
import { usersBreadcrumbs } from "../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const user = await usersControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs
				items={usersBreadcrumbs.detail(
					id,
					`${user.firstName} ${user.lastName}`,
				)}
			/>
			<UserDetailsClient user={user} />
		</>
	);
}
