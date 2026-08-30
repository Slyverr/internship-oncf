"use client";

import { PageHeader } from "@/components/common/page-header";
import { UserActions } from "@/components/users/user-actions";
import { UserOverview } from "@/components/users/user-overview";
import type { UserDetailDto } from "@/lib/api/generated.schemas";
import { useUsersControllerFindOne } from "@/lib/api/users";

interface UserDetailsClientProps {
	user: UserDetailDto;
}

export function UserDetailsClient({ user }: UserDetailsClientProps) {
	const { data: currentUser } = useUsersControllerFindOne(user.id, {
		query: {
			initialData: user,
		},
	});

	if (!currentUser) return null;

	return (
		<>
			<PageHeader
				title={`${currentUser.firstName} ${currentUser.lastName}`}
				description={currentUser.email}
			>
				<UserActions user={currentUser} />
			</PageHeader>

			<UserOverview user={currentUser} />
		</>
	);
}
