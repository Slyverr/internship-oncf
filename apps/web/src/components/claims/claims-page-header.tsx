"use client";

import { Permission } from "@ecommand/shared";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";
import { useAuth } from "@/providers/auth-provider";

export function ClaimsPageHeader() {
	const t = useTranslate();
	const { hasPermission } = useAuth();

	return (
		<PageHeader
			title={t(Messages.claims.title)}
			description={t(Messages.claims.pageDescription)}
		>
			{hasPermission(Permission.CLAIMS_CREATE) && (
				<Link className={buttonVariants()} href="/dashboard/claims/new">
					<PlusIcon />
					{t(Messages.claims.create)}
				</Link>
			)}
		</PageHeader>
	);
}
