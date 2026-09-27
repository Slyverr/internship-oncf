"use client";

import { InlineQueryRetry } from "@/components/common/inline-query-retry";
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
	isError?: boolean;
	isFetching?: boolean;
	onRetry?: () => void;
	id?: string;
	value?: User["id"];
	onChange: (value: User["id"]) => void;
	placeholder?: string;
}

export function UserSelect({
	users,
	id,
	value,
	onChange,
	isLoading,
	isError,
	isFetching = false,
	onRetry,
	placeholder = "Select user",
}: UserSelectProps) {
	const selectedUser = users.find((user) => user.id === value);

	return (
		<div className="space-y-2">
			<Combobox
				items={users}
				disabled={isLoading || (isError && users.length === 0)}
				value={selectedUser ?? null}
				onValueChange={(user) => user && onChange(user.id)}
				itemToStringLabel={(user) => `${user.firstName} ${user.lastName}`}
				itemToStringValue={(user) => String(user.id)}
			>
				<ComboboxInput
					id={id}
					placeholder={placeholder}
					aria-label="Select user"
				/>

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
			{isError && onRetry && (
				<InlineQueryRetry
					message="Could not load users. Check your connection."
					retryLabel="Retry users"
					isFetching={isFetching}
					onRetry={onRetry}
				/>
			)}
		</div>
	);
}
