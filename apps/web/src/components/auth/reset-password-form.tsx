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

	return (
		<AuthPageLayout>
			<Card className="w-full max-w-sm">
				<form action={action} className="grid gap-4">
					<CardHeader className="space-y-2 text-center">
						<CardTitle className="text-2xl font-bold">
							{t(Messages.auth.recovery.resetTitle)}
						</CardTitle>
						<CardDescription>{t(Messages.auth.passwordHint)}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{state?.successCode ? (
							<p role="status" className="text-sm text-muted-foreground">
								{translateApiResponse(state.successCode, locale) ??
									t(Messages.auth.recovery.passwordUpdated)}
							</p>
						) : (
							<>
								<div className="oncf-field">
									<Label htmlFor="password">
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
									<Label htmlFor="confirmation">
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
					</CardContent>
					<CardFooter className="flex flex-col gap-4">
						{!state?.successCode && (
							<Button
								className="w-full"
								type="submit"
								disabled={pending || !token}
							>
								{pending
									? t(Messages.auth.recovery.saving)
									: t(Messages.auth.recovery.setPassword)}
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
