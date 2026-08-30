import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { UserCreateForm } from "@/components/users/user-create-form";
import { usersBreadcrumbs } from "../breadcrumbs";

export default function Page() {
	return (
		<>
			<Breadcrumbs items={usersBreadcrumbs.create()} />
			<UserCreateForm />
		</>
	);
}
