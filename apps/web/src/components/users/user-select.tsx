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
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import type { UserDetailDto } from "@/lib/api/generated.schemas";

type User = Pick<UserDetailDto, "id" | "firstName" | "lastName">;

interface UserSelectProps {
	users: User[];
	isLoading?: boolean;
	isError?: boolean;
	isFetching?: boolean;
	onRetry?: () => void;
	id: string;
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
	placeholder,
}: UserSelectProps) {
	const t = useTranslate();
	const resolvedPlaceholder =
		placeholder ?? t(Messages.users.select.placeholder);
	const selectedUser = users.find((user) => user.id === value);

	return (
		<>
			<Combobox
				items={users}
				disabled={isLoading || (isError && users.length === 0)}
				value={selectedUser ?? null}
				onValueChange={(user) => user && onChange(user.id)}
				itemToStringLabel={(user) => `${user.firstName} ${user.lastName}`}
				itemToStringValue={(user) => String(user.id)}
			>
				<ComboboxInput id={id} placeholder={resolvedPlaceholder} />

				<ComboboxContent>
					<ComboboxEmpty>{t(Messages.users.select.empty)}</ComboboxEmpty>

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
					message={t(Messages.users.select.loadFailed)}
					retryLabel={t(Messages.users.select.retry)}
					isFetching={isFetching}
					onRetry={onRetry}
				/>
			)}
		</>
	);
}
