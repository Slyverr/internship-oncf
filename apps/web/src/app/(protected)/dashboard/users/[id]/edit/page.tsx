import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UserEditForm } from "@/components/users/user-edit-form";
import { usersControllerFindOne } from "@/lib/api/users";
import { usersBreadcrumbs } from "../../breadcrumbs";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	const user = await usersControllerFindOne(Number(id));

	return (
		<>
			<Breadcrumbs
				items={usersBreadcrumbs.edit(id, `${user.firstName} ${user.lastName}`)}
			/>
			<UserEditForm user={user} />
		</>
	);
}
