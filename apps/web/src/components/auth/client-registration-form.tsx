"use client";

import { isStrongPassword, STRONG_PASSWORD_HINT } from "@ecommand/shared";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthControllerRegister } from "@/lib/api/auth";
import { getFormErrorMessage } from "@/lib/form-utils";
import { AuthPageLayout } from "./auth-page-layout";

export function ClientRegistrationForm() {
	const register = useAuthControllerRegister();
	const [submitted, setSubmitted] = useState(false);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [customerCode, setCustomerCode] = useState("");
	const [ice, setIce] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formError, setFormError] = useState("");

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError("");
		if (!isStrongPassword(password)) {
			setFormError(STRONG_PASSWORD_HINT);
			return;
		}
		if (password !== confirmPassword) {
			setFormError("Passwords do not match.");
			return;
		}

		register.mutate(
			{
				data: {
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					customerCode: customerCode.trim(),
					ice,
					email: email.trim().toLowerCase(),
					password,
				},
			},
			{
				onSuccess: () => setSubmitted(true),
				onError: (error) =>
					setFormError(
						getFormErrorMessage(error) ??
							"We could not submit your request. Check your details and try again.",
					),
			},
		);
	}

	return (
		<AuthPageLayout>
			<form onSubmit={submit} className="mx-auto grid w-full max-w-2xl">
				<header className="grid gap-control px-4 pb-4">
					<h1 className="text-2xl font-bold tracking-tight">
						Request account access
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your details and company code. An administrator must approve
						your request before you can sign in.
					</p>
				</header>
				<div className="grid items-start gap-4 px-4 sm:grid-cols-2">
					{submitted ? (
						<div
							role="status"
							className="rounded-lg border bg-muted/40 p-4 text-sm sm:col-span-2"
						>
							<p className="font-medium">Request received</p>
							<p className="mt-2 text-muted-foreground">
								An administrator will review your company details. You can sign
								in after your request is approved.
							</p>
						</div>
					) : (
						<>
							{formError && (
								<p
									role="alert"
									className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive sm:col-span-2"
								>
									{formError}
								</p>
							)}
							<div className="grid gap-control">
								<Label htmlFor="registration-first-name">First name</Label>
								<Input
									id="registration-first-name"
									value={firstName}
									autoComplete="given-name"
									required
									maxLength={100}
									onChange={(event) => setFirstName(event.target.value)}
								/>
							</div>
							<div className="grid gap-control">
								<Label htmlFor="registration-last-name">Last name</Label>
								<Input
									id="registration-last-name"
									value={lastName}
									autoComplete="family-name"
									required
									maxLength={100}
									onChange={(event) => setLastName(event.target.value)}
								/>
							</div>
							<div className="grid gap-control">
								<Label htmlFor="registration-customer-code">
									Customer code
								</Label>
								<Input
									id="registration-customer-code"
									value={customerCode}
									autoComplete="off"
									required
									maxLength={50}
									placeholder="Company code"
									onChange={(event) => setCustomerCode(event.target.value)}
								/>
							</div>
							<div className="grid gap-control">
								<Label htmlFor="registration-ice">ICE</Label>
								<Input
									id="registration-ice"
									value={ice}
									autoComplete="off"
									inputMode="numeric"
									required
									maxLength={15}
									pattern="[0-9]{15}"
									aria-describedby="registration-ice-help"
									placeholder="15 digits"
									onChange={(event) => setIce(event.target.value)}
								/>
								<p
									id="registration-ice-help"
									className="text-meta text-muted-foreground"
								>
									Enter your company's 15-digit ICE.
								</p>
							</div>
							<div className="grid gap-control sm:col-span-2">
								<Label htmlFor="registration-email">Email address</Label>
								<Input
									id="registration-email"
									value={email}
									type="email"
									autoComplete="email"
									required
									maxLength={100}
									onChange={(event) => setEmail(event.target.value)}
								/>
							</div>
							<div className="grid gap-control">
								<Label htmlFor="registration-password">Password</Label>
								<Input
									id="registration-password"
									value={password}
									type="password"
									autoComplete="new-password"
									aria-describedby="registration-password-help"
									required
									maxLength={255}
									onChange={(event) => setPassword(event.target.value)}
								/>
								<p
									id="registration-password-help"
									className="text-meta text-muted-foreground"
								>
									{STRONG_PASSWORD_HINT}
								</p>
							</div>
							<div className="grid gap-control">
								<Label htmlFor="registration-password-confirmation">
									Confirm password
								</Label>
								<Input
									id="registration-password-confirmation"
									value={confirmPassword}
									type="password"
									autoComplete="new-password"
									required
									maxLength={255}
									onChange={(event) => setConfirmPassword(event.target.value)}
								/>
							</div>
						</>
					)}
				</div>
				<footer className="grid justify-items-center gap-4 px-4 pt-4">
					{!submitted && (
						<Button
							className="w-full"
							type="submit"
							disabled={register.isPending}
						>
							{register.isPending ? "Submitting request..." : "Request access"}
						</Button>
					)}
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/login"
							className="underline underline-offset-4 hover:text-primary"
						>
							Sign in
						</Link>
					</p>
				</footer>
			</form>
		</AuthPageLayout>
	);
}
