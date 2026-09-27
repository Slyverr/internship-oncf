"use client";

import { STRONG_PASSWORD_HINT } from "@ecommand/shared";
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
import { AuthPageLayout } from "./auth-page-layout";
import {
	type ResetPasswordState,
	resetPasswordAction,
} from "./reset-password-action";

export function ResetPasswordForm({ token }: { token: string }) {
	const actionWithToken = resetPasswordAction.bind(null, token);
	const [state, action, pending] = useActionState(
		actionWithToken,
		null as ResetPasswordState | null,
	);

	return (
		<AuthPageLayout>
			<Card className="w-full max-w-sm">
				<form action={action}>
					<CardHeader className="space-y-2 text-center">
						<CardTitle className="text-2xl font-bold">
							Choose a new password
						</CardTitle>
						<CardDescription>{STRONG_PASSWORD_HINT}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{state?.success ? (
							<p role="status" className="text-sm text-muted-foreground">
								Your password has been changed. You can now sign in.
							</p>
						) : (
							<>
								<div className="space-y-2">
									<Label htmlFor="password">New password</Label>
									<Input
										id="password"
										name="password"
										type="password"
										required
										autoComplete="new-password"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirmation">Confirm password</Label>
									<Input
										id="confirmation"
										name="confirmation"
										type="password"
										required
										autoComplete="new-password"
									/>
								</div>
							</>
						)}
						{state?.error && (
							<p role="alert" className="text-sm text-destructive">
								{state.error}
							</p>
						)}
					</CardContent>
					<CardFooter className="flex flex-col gap-4">
						{!state?.success && (
							<Button
								className="w-full"
								type="submit"
								disabled={pending || !token}
							>
								{pending ? "Saving..." : "Set new password"}
							</Button>
						)}
						<Link
							className="text-sm underline underline-offset-4"
							href="/login"
						>
							Back to sign in
						</Link>
					</CardFooter>
				</form>
			</Card>
		</AuthPageLayout>
	);
}
