"use client";

import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import type { UserDetailDto } from "@/lib/api/generated.schemas";

type User = Pick<UserDetailDto, "id" | "firstName" | "lastName">;

interface UserSelectProps {
	users: User[];
	isLoading?: boolean;
	value?: User["id"];
	onChange: (value: User["id"]) => void;
	placeholder?: string;
}

export function UserSelect({
	users,
	value,
	onChange,
	isLoading,
	placeholder = "Select user",
}: UserSelectProps) {
	const selectedUser = users.find((user) => user.id === value);

	return (
		<Combobox
			items={users}
			disabled={isLoading}
			value={selectedUser ?? null}
			onValueChange={(user) => user && onChange(user.id)}
			itemToStringLabel={(user) => `${user.firstName} ${user.lastName}`}
			itemToStringValue={(user) => String(user.id)}
		>
			<ComboboxInput placeholder={placeholder} aria-label="Select user" />

			<ComboboxContent>
				<ComboboxEmpty>No users found.</ComboboxEmpty>

				<ComboboxList>
					{(user) => (
						<ComboboxItem key={user.id} value={user}>
							{user.firstName} {user.lastName}
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
