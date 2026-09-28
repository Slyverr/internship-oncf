"use client";

import { Permission } from "@ecommand/shared";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function ClaimsPageHeader() {
	const { hasPermission } = useAuth();

	return (
		<PageHeader title="Claims" description="Review and manage customer claims.">
			{hasPermission(Permission.CLAIMS_CREATE) && (
				<Link className={buttonVariants()} href="/dashboard/claims/new">
					<PlusIcon />
					Create Claim
				</Link>
			)}
		</PageHeader>
	);
}
