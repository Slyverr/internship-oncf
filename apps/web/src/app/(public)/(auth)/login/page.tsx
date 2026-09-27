"use client";

import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type LoginState, loginAction } from "./actions";

export default function Page() {
	const router = useRouter();
	const [state, action, pending] = useActionState(
		loginAction,
		null as LoginState | null,
	);
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		if (state?.success) {
			router.push("/dashboard");
		}
	}, [state, router]);

	return (
		<AuthPageLayout>
			<form action={action} className="mx-auto grid w-full max-w-md">
				<header className="grid gap-control px-4 pb-4">
					<h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
				</header>
				<div className="grid gap-5 px-4">
					{state?.errors?.form && (
						<div
							role="alert"
							className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
						>
							{state.errors.form}
						</div>
					)}
					<div className="space-y-2">
						<Label htmlFor="username">Email</Label>
						<Input
							id="username"
							name="username"
							type="email"
							placeholder="email@example.com"
							autoComplete="username"
							autoCapitalize="none"
							spellCheck={false}
							required
							defaultValue={state?.data?.username || ""}
							aria-invalid={Boolean(state?.errors?.username)}
							aria-describedby={
								state?.errors?.username ? "username-error" : undefined
							}
							className={
								state?.errors?.username
									? "border-destructive focus-visible:ring-destructive/20"
									: ""
							}
						/>
						{state?.errors?.username && (
							<p id="username-error" className="text-sm text-destructive">
								{state.errors.username}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
							<Link
								href="/forgot-password"
								className="text-sm text-muted-foreground underline-offset-4 hover:underline"
							>
								Forgot password?
							</Link>
						</div>
						<div className="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								autoComplete="current-password"
								required
								aria-invalid={Boolean(state?.errors?.password)}
								aria-describedby={
									state?.errors?.password ? "password-error" : undefined
								}
								className={
									state?.errors?.password
										? "border-destructive pr-12 focus-visible:ring-destructive/20"
										: "pr-12"
								}
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label={showPassword ? "Hide password" : "Show password"}
								aria-pressed={showPassword}
								aria-controls="password"
								className="absolute top-0.5 right-0.5 size-11"
								onClick={() => setShowPassword((visible) => !visible)}
							>
								{showPassword ? (
									<EyeOffIcon aria-hidden="true" />
								) : (
									<EyeIcon aria-hidden="true" />
								)}
							</Button>
						</div>
						{state?.errors?.password && (
							<p id="password-error" className="text-sm text-destructive">
								{state.errors.password}
							</p>
						)}
					</div>
					<div className="flex min-h-12 items-center gap-2">
						<Checkbox
							id="remember"
							name="remember"
							defaultChecked={state?.data?.remember || false}
						/>
						<Label htmlFor="remember" className="text-sm font-normal">
							Remember me
						</Label>
					</div>
				</div>
				<footer className="grid justify-items-center gap-4 px-4 pt-4">
					<Button className="w-full" type="submit" disabled={pending}>
						{pending ? (
							<>
								<LoaderCircleIcon
									aria-hidden="true"
									className="animate-spin motion-reduce:animate-none"
								/>
								Signing in...
							</>
						) : (
							"Sign in"
						)}
					</Button>
					<p className="text-sm text-muted-foreground">
						Don't have an account?{" "}
						<Link
							href="/signup"
							className="underline underline-offset-4 hover:text-primary"
						>
							Sign up
						</Link>
					</p>
				</footer>
			</form>
		</AuthPageLayout>
	);
}
