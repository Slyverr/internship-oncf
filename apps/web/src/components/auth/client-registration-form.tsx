"use client";

import {
	isStrongPassword,
	STRONG_PASSWORD_HINT,
	STRONG_PASSWORD_MAX_LENGTH,
	STRONG_PASSWORD_REQUIREMENTS,
} from "@ecommand/shared";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import {
	GuidedFormProgress,
	type GuidedFormStep,
} from "@/components/common/guided-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthControllerRegister } from "@/lib/api/auth";
import { getFormErrorMessage } from "@/lib/form-utils";
import { AuthPageLayout } from "./auth-page-layout";

const registrationSteps: GuidedFormStep[] = [
	{ title: "Company details", description: "Your name and company code" },
	{ title: "Sign-in details", description: "Email and password" },
];

export function ClientRegistrationForm() {
	const register = useAuthControllerRegister();
	const [submitted, setSubmitted] = useState(false);
	const [step, setStep] = useState(0);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [customerCode, setCustomerCode] = useState("");
	const [ice, setIce] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formError, setFormError] = useState("");
	const missingPasswordRequirements = STRONG_PASSWORD_REQUIREMENTS.filter(
		(requirement) => !requirement.isMet(password),
	).map((requirement) => requirement.label);
	const passwordStatus =
		password.length === 0
			? STRONG_PASSWORD_HINT
			: missingPasswordRequirements.length === 0
				? "Password meets the requirements."
				: "Add " + missingPasswordRequirements.join(", ") + ".";

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError("");
		if (step === 0) {
			setStep(1);
			return;
		}
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
			<form onSubmit={submit} className="mx-auto grid w-full max-w-md gap-4">
				<header className="grid gap-control px-4">
					<h1 className="text-2xl font-bold tracking-tight">
						Create your account
					</h1>
					<p className="text-sm text-muted-foreground">
						Company access starts after administrator approval.
					</p>
				</header>
				{submitted ? (
					<div
						role="status"
						className="grid min-h-96 content-center gap-2 px-4"
					>
						<p className="font-medium">Request received</p>
						<p className="text-sm text-muted-foreground">
							An administrator will review your company details. You can sign in
							after your request is approved.
						</p>
					</div>
				) : (
					<>
						<div className="px-4">
							<GuidedFormProgress
								steps={registrationSteps}
								currentStep={step}
							/>
						</div>
						<div className="min-h-88 px-4 sm:min-h-60">
							{formError && (
								<p
									role="alert"
									className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
								>
									{formError}
								</p>
							)}
							{step === 0 ? (
								<div className="grid items-start gap-4 sm:grid-cols-2">
									<div className="oncf-field">
										<Label htmlFor="registration-first-name">First name</Label>
										<Input
											id="registration-first-name"
											value={firstName}
											placeholder="e.g. Samira"
											autoComplete="given-name"
											required
											maxLength={100}
											onChange={(event) => setFirstName(event.target.value)}
										/>
									</div>
									<div className="oncf-field">
										<Label htmlFor="registration-last-name">Last name</Label>
										<Input
											id="registration-last-name"
											value={lastName}
											placeholder="e.g. El Amrani"
											autoComplete="family-name"
											required
											maxLength={100}
											onChange={(event) => setLastName(event.target.value)}
										/>
									</div>
									<div className="oncf-field">
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
									<div className="oncf-field">
										<Label htmlFor="registration-ice">
											Company identifier (ICE)
										</Label>
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
											Enter the company's 15-digit identifier.
										</p>
									</div>
								</div>
							) : (
								<div className="grid items-start gap-4">
									<div className="oncf-field">
										<Label htmlFor="registration-email">Email address</Label>
										<Input
											id="registration-email"
											value={email}
											type="email"
											placeholder="name@company.com"
											autoComplete="email"
											required
											maxLength={100}
											onChange={(event) => setEmail(event.target.value)}
										/>
									</div>
									<div className="grid items-start gap-4 sm:grid-cols-2">
										<div className="oncf-field">
											<Label htmlFor="registration-password">Password</Label>
											<Input
												id="registration-password"
												value={password}
												type="password"
												autoComplete="new-password"
												aria-describedby="registration-password-status"
												required
												maxLength={STRONG_PASSWORD_MAX_LENGTH}
												placeholder="Create a password"
												onChange={(event) => setPassword(event.target.value)}
											/>
										</div>
										<div className="oncf-field">
											<Label htmlFor="registration-password-confirmation">
												Confirm password
											</Label>
											<Input
												id="registration-password-confirmation"
												value={confirmPassword}
												type="password"
												autoComplete="new-password"
												aria-describedby="registration-confirmation-status"
												required
												maxLength={STRONG_PASSWORD_MAX_LENGTH}
												placeholder="Repeat your password"
												onChange={(event) =>
													setConfirmPassword(event.target.value)
												}
											/>
											<p
												id="registration-confirmation-status"
												role="status"
												className={
													confirmPassword.length === 0 ||
													confirmPassword === password
														? "text-meta text-muted-foreground"
														: "text-meta text-destructive"
												}
											>
												{confirmPassword.length === 0
													? null
													: confirmPassword === password
														? "Passwords match."
														: "Passwords do not match."}
											</p>
										</div>
									</div>
									<p
										id="registration-password-status"
										aria-live="polite"
										className="text-meta text-muted-foreground"
									>
										{passwordStatus}
									</p>
								</div>
							)}
						</div>
						<footer className="grid gap-4 px-4">
							<div className="flex justify-end gap-control">
								{step === 1 && (
									<Button
										type="button"
										variant="outline"
										disabled={register.isPending}
										onClick={() => {
											setFormError("");
											setStep(0);
										}}
									>
										Back
									</Button>
								)}
								<Button type="submit" disabled={register.isPending}>
									{step === 0
										? "Continue"
										: register.isPending
											? "Submitting request…"
											: "Request access"}
								</Button>
							</div>
							<p className="text-center text-sm text-muted-foreground">
								Already have an account?{" "}
								<Link
									href="/login"
									className="underline underline-offset-4 hover:text-primary"
								>
									Sign in
								</Link>
							</p>
						</footer>
					</>
				)}
			</form>
		</AuthPageLayout>
	);
}
