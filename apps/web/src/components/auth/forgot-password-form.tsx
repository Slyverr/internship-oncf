"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Messages, translateApiResponse } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { AuthPageLayout } from "./auth-page-layout";
import {
	type ForgotPasswordState,
	forgotPasswordAction,
} from "./forgot-password-action";

export function ForgotPasswordForm() {
	const t = useTranslate();
	const locale = useLocale();
	const [state, action, pending] = useActionState(
		forgotPasswordAction,
		null as ForgotPasswordState | null,
	);

	return (
		<AuthPageLayout>
			<Card className="w-full max-w-sm">
				<form action={action} className="grid gap-4">
					<CardHeader className="space-y-2 text-center">
						<CardTitle className="text-2xl font-bold">
							{t(Messages.auth.recovery.forgotTitle)}
						</CardTitle>
						<CardDescription>
							{t(Messages.auth.recovery.forgotDescription)}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{state?.successCode ? (
							<p role="status" className="text-sm text-muted-foreground">
								{translateApiResponse(state.successCode, locale) ??
									t(Messages.auth.recovery.requestAccepted)}
							</p>
						) : (
							<div className="oncf-field">
								<Label htmlFor="email">{t(Messages.auth.recovery.email)}</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder={t(Messages.auth.recovery.emailPlaceholder)}
									required
									autoComplete="email"
								/>
							</div>
						)}
						{state?.errorKey && (
							<p role="alert" className="text-sm text-destructive">
								{t(state.errorKey)}
							</p>
						)}
					</CardContent>
					<CardFooter className="flex flex-col gap-4">
						{!state?.successCode && (
							<Button className="w-full" type="submit" disabled={pending}>
								{pending
									? t(Messages.auth.recovery.sending)
									: t(Messages.auth.recovery.sendLink)}
							</Button>
						)}
						<Link
							className="text-sm underline underline-offset-4"
							href="/login"
						>
							{t(Messages.auth.recovery.backToSignIn)}
						</Link>
					</CardFooter>
				</form>
			</Card>
		</AuthPageLayout>
	);
}
