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
import { AuthPageLayout } from "./auth-page-layout";
import {
	type ForgotPasswordState,
	forgotPasswordAction,
} from "./forgot-password-action";

export function ForgotPasswordForm() {
	const [state, action, pending] = useActionState(
		forgotPasswordAction,
		null as ForgotPasswordState | null,
	);

	return (
		<AuthPageLayout>
			<Card className="w-full max-w-sm">
				<form action={action}>
					<CardHeader className="space-y-2 text-center">
						<CardTitle className="text-2xl font-bold">Reset password</CardTitle>
						<CardDescription>
							Enter the email address associated with your account.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{state?.success ? (
							<p role="status" className="text-sm text-muted-foreground">
								If an account matches that address, a reset link will be sent.
							</p>
						) : (
							<div className="oncf-field">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="name@company.com"
									required
									autoComplete="email"
								/>
							</div>
						)}
						{state?.error && (
							<p role="alert" className="text-sm text-destructive">
								{state.error}
							</p>
						)}
					</CardContent>
					<CardFooter className="flex flex-col gap-4">
						{!state?.success && (
							<Button className="w-full" type="submit" disabled={pending}>
								{pending ? "Sending..." : "Send reset link"}
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
