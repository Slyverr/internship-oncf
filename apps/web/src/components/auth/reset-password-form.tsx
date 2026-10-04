"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Messages, translateApiResponse } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { AuthPageLayout } from "./auth-page-layout";
import {
	type ResetPasswordState,
	resetPasswordAction,
} from "./reset-password-action";

export function ResetPasswordForm({ token }: { token: string }) {
	const t = useTranslate();
	const locale = useLocale();
	const actionWithToken = resetPasswordAction.bind(null, token);
	const [state, action, pending] = useActionState(
		actionWithToken,
		null as ResetPasswordState | null,
	);
	const hasValidToken = token.length > 0;

	return (
		<AuthPageLayout>
			<form action={action} className="mx-auto grid w-full max-w-sm gap-4">
				<header className="grid gap-control pb-4">
					<h1 className="text-2xl font-bold tracking-tight">
						{t(Messages.auth.recovery.resetTitle)}
					</h1>
					<p className="text-sm text-muted-foreground">
						{hasValidToken
							? t(Messages.auth.passwordHint)
							: t(Messages.auth.recovery.invalidLinkHelp)}
					</p>
				</header>
				<div className="grid gap-4">
					{state?.successCode ? (
						<p role="status" className="text-sm text-muted-foreground">
							{translateApiResponse(state.successCode, locale) ??
								t(Messages.auth.recovery.passwordUpdated)}
						</p>
					) : !hasValidToken ? (
						<p role="alert" className="text-sm text-destructive">
							{t(Messages.auth.recovery.invalidLink)}
						</p>
					) : (
						<>
							<div className="oncf-field">
								<Label htmlFor="password" required>
									{t(Messages.auth.recovery.newPassword)}
								</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder={t(Messages.auth.recovery.newPassword)}
									required
									autoComplete="new-password"
								/>
							</div>
							<div className="oncf-field">
								<Label htmlFor="confirmation" required>
									{t(Messages.auth.recovery.confirmPassword)}
								</Label>
								<Input
									id="confirmation"
									name="confirmation"
									type="password"
									placeholder={t(Messages.auth.recovery.confirmPassword)}
									required
									autoComplete="new-password"
								/>
							</div>
						</>
					)}
					{state?.errorKey && (
						<p role="alert" className="text-sm text-destructive">
							{t(state.errorKey)}
						</p>
					)}
				</div>
				<footer className="grid justify-items-center gap-4 pt-4">
					{!state?.successCode &&
						(hasValidToken ? (
							<Button className="w-full" type="submit" disabled={pending}>
								{pending
									? t(Messages.auth.recovery.saving)
									: t(Messages.auth.recovery.setPassword)}
							</Button>
						) : (
							<Button
								className="w-full"
								render={<Link href="/forgot-password" />}
							>
								{t(Messages.auth.recovery.requestNewLink)}
							</Button>
						))}
					<Link className="text-sm underline underline-offset-4" href="/login">
						{t(Messages.auth.recovery.backToSignIn)}
					</Link>
				</footer>
			</form>
		</AuthPageLayout>
	);
}
