"use client";

import { ActivityIcon, KeyRoundIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Messages } from "@/i18n";
import { useTranslate } from "@/i18n/locale-provider";

export function IntegrationsOverviewPage() {
	const t = useTranslate();

	return (
		<div className="workspace-page">
			<PageHeader
				title={t(Messages.navigation.integrations)}
				description={t(Messages.integrationsOverview.description)}
			/>
			<div className="grid gap-4 @4xl/workspace:grid-cols-2">
				<Card className="flex flex-col">
					<CardHeader className="grid gap-2">
						<KeyRoundIcon aria-hidden="true" className="size-5 text-primary" />
						<CardTitle>
							{t(Messages.integrationCredentials.pageTitle)}
						</CardTitle>
						<p className="text-sm text-muted-foreground">
							{t(Messages.integrationsOverview.credentialsDescription)}
						</p>
					</CardHeader>
					<CardContent className="mt-auto">
						<Button
							render={<Link href="/dashboard/integrations/credentials" />}
						>
							{t(Messages.integrationsOverview.openCredentials)}
						</Button>
					</CardContent>
				</Card>
				<Card className="flex flex-col">
					<CardHeader className="grid gap-2">
						<ActivityIcon aria-hidden="true" className="size-5 text-primary" />
						<CardTitle>{t(Messages.dtmActivity.pageTitle)}</CardTitle>
						<p className="text-sm text-muted-foreground">
							{t(Messages.integrationsOverview.dtmDescription)}
						</p>
					</CardHeader>
					<CardContent className="mt-auto">
						<Button render={<Link href="/dashboard/integrations/dtm" />}>
							{t(Messages.integrationsOverview.openDtm)}
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
