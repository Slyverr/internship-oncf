"use client";

import { InlineQueryRetry } from "@/components/common/inline-query-retry";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type AppLocale, Messages } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import type { RoleProfileDto } from "@/lib/api/generated.schemas";
import { formatUserRole } from "@/lib/user-labels";

export function roleProfileLabel(profile: RoleProfileDto, locale?: AppLocale) {
	return profile.isSystem ? formatUserRole(profile.name, locale) : profile.name;
}

export function RoleProfileSelect({
	profiles,
	value,
	onValueChange,
	disabled = false,
	isError = false,
	isFetching = false,
	onRetry,
}: {
	profiles: RoleProfileDto[];
	value: string;
	onValueChange: (value: string) => void;
	disabled?: boolean;
	isError?: boolean;
	isFetching?: boolean;
	onRetry?: () => void;
}) {
	const t = useTranslate();
	const locale = useLocale();
	const selectedProfile = profiles.find(({ id }) => id === value);

	return (
		<>
			<Select
				value={value}
				onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}
			>
				<SelectTrigger id="roleId" disabled={disabled || profiles.length === 0}>
					<SelectValue>
						{selectedProfile
							? roleProfileLabel(selectedProfile, locale)
							: t(Messages.users.form.roleUnavailable)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{profiles.map((profile) => (
						<SelectItem key={profile.id} value={profile.id}>
							{roleProfileLabel(profile, locale)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{isError && onRetry && (
				<InlineQueryRetry
					message={t(Messages.users.form.rolesLoadFailed)}
					retryLabel={t(Messages.common.actions.retry)}
					isFetching={isFetching}
					onRetry={onRetry}
				/>
			)}
		</>
	);
}
