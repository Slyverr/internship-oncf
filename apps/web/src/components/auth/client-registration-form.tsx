"use client";

import {
	CUSTOMER_ICE_LENGTH,
	CUSTOMER_ICE_PATTERN,
	isStrongPassword,
	STRONG_PASSWORD_MAX_LENGTH,
	STRONG_PASSWORD_REQUIREMENTS,
} from "@ecommand/shared";
import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import {
	GuidedFormProgress,
	type GuidedFormStep,
} from "@/components/common/guided-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormErrorMessage } from "@/hooks/use-form-error-message";
import { type MessageKey, Messages, translateApiResponse } from "@/i18n";
import { useLocale, useTranslate } from "@/i18n/locale-provider";
import { useAuthControllerRegister } from "@/lib/api/auth";
import { AuthPageLayout } from "./auth-page-layout";

const requirementLabels: Record<
	(typeof STRONG_PASSWORD_REQUIREMENTS)[number]["id"],
	MessageKey
> = {
	"minimum-length": Messages.auth.signup.passwordRequirements.minimumLength,
	lowercase: Messages.auth.signup.passwordRequirements.lowercase,
	uppercase: Messages.auth.signup.passwordRequirements.uppercase,
	number: Messages.auth.signup.passwordRequirements.number,
	symbol: Messages.auth.signup.passwordRequirements.symbol,
	"maximum-length": Messages.auth.signup.passwordRequirements.maximumLength,
};

export function ClientRegistrationForm() {
	const t = useTranslate();
	const getErrorMessage = useFormErrorMessage();
	const locale = useLocale();
	const register = useAuthControllerRegister();
	const [submitted, setSubmitted] = useState(false);
	const [submittedCode, setSubmittedCode] = useState<string>();
	const [step, setStep] = useState(0);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [customerCode, setCustomerCode] = useState("");
	const [ice, setIce] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [formError, setFormError] = useState("");
	const passwordRef = useRef<HTMLInputElement>(null);
	const confirmationRef = useRef<HTMLInputElement>(null);
	const missingPasswordRequirements = STRONG_PASSWORD_REQUIREMENTS.filter(
		(requirement) => !requirement.isMet(password),
	).map((requirement) => t(requirementLabels[requirement.id]));
	const passwordStatus =
		password.length === 0
			? t(Messages.auth.passwordHint)
			: missingPasswordRequirements.length === 0
				? t(Messages.auth.signup.passwordMeetsRequirements)
				: t(Messages.auth.signup.passwordAddRequirements, {
						requirements: missingPasswordRequirements.join(", "),
					});
	const registrationSteps: GuidedFormStep[] = [
		{
			title: t(Messages.auth.signup.stepCompany),
			description: t(Messages.auth.signup.stepCompanyDescription),
		},
		{
			title: t(Messages.auth.signup.stepSignIn),
			description: t(Messages.auth.signup.stepSignInDescription),
		},
	];

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError("");
		if (step === 0) {
			setStep(1);
			return;
		}
		if (!isStrongPassword(password)) {
			setFormError(t(Messages.auth.passwordHint));
			window.requestAnimationFrame(() => passwordRef.current?.focus());
			return;
		}
		if (password !== confirmPassword) {
			setFormError(t(Messages.auth.signup.passwordMismatch));
			window.requestAnimationFrame(() => confirmationRef.current?.focus());
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
				onSuccess: ({ code }) => {
					setSubmittedCode(code);
					setSubmitted(true);
				},
				onError: (error) =>
					setFormError(
						getErrorMessage(error) ?? t(Messages.auth.signup.requestFailed),
					),
			},
		);
	}

	return (
		<AuthPageLayout>
			<form onSubmit={submit} className="mx-auto grid w-full max-w-md gap-4">
				<header className="grid gap-control px-4">
					<h1 className="text-2xl font-bold tracking-tight">
						{t(Messages.auth.signup.title)}
					</h1>
					<p className="text-sm text-muted-foreground">
						{t(Messages.auth.signup.description)}
					</p>
				</header>
				{submitted ? (
					<div
						role="status"
						className="grid min-h-96 content-center gap-2 px-4"
					>
						<p className="font-medium">
							{submittedCode
								? (translateApiResponse(submittedCode, locale) ??
									t(Messages.auth.signup.requestReceived))
								: t(Messages.auth.signup.requestReceived)}
						</p>
						<p className="text-sm text-muted-foreground">
							{t(Messages.auth.signup.requestReview)}
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
										<Label htmlFor="registration-first-name">
											{t(Messages.auth.signup.firstName)}
										</Label>
										<Input
											id="registration-first-name"
											value={firstName}
											placeholder={t(Messages.auth.signup.firstNamePlaceholder)}
											autoComplete="given-name"
											required
											maxLength={100}
											onChange={(event) => setFirstName(event.target.value)}
										/>
									</div>
									<div className="oncf-field">
										<Label htmlFor="registration-last-name">
											{t(Messages.auth.signup.lastName)}
										</Label>
										<Input
											id="registration-last-name"
											value={lastName}
											placeholder={t(Messages.auth.signup.lastNamePlaceholder)}
											autoComplete="family-name"
											required
											maxLength={100}
											onChange={(event) => setLastName(event.target.value)}
										/>
									</div>
									<div className="oncf-field">
										<Label htmlFor="registration-customer-code">
											{t(Messages.auth.signup.customerCode)}
										</Label>
										<Input
											id="registration-customer-code"
											value={customerCode}
											autoComplete="off"
											required
											maxLength={50}
											placeholder={t(
												Messages.auth.signup.customerCodePlaceholder,
											)}
											onChange={(event) => setCustomerCode(event.target.value)}
										/>
									</div>
									<div className="oncf-field">
										<Label htmlFor="registration-ice">
											{t(Messages.auth.signup.ice)}
										</Label>
										<Input
											id="registration-ice"
											value={ice}
											autoComplete="off"
											inputMode="numeric"
											required
											maxLength={CUSTOMER_ICE_LENGTH}
											pattern={CUSTOMER_ICE_PATTERN.source}
											aria-describedby="registration-ice-help"
											placeholder={t(Messages.auth.signup.icePlaceholder)}
											onChange={(event) => setIce(event.target.value)}
										/>
										<p
											id="registration-ice-help"
											className="text-meta text-muted-foreground"
										>
											{t(Messages.auth.signup.iceHelp)}
										</p>
									</div>
								</div>
							) : (
								<div className="grid items-start gap-4">
									<div className="oncf-field">
										<Label htmlFor="registration-email">
											{t(Messages.auth.signup.email)}
										</Label>
										<Input
											id="registration-email"
											value={email}
											type="email"
											placeholder={t(Messages.auth.signup.emailPlaceholder)}
											autoComplete="email"
											required
											maxLength={100}
											onChange={(event) => setEmail(event.target.value)}
										/>
									</div>
									<div className="grid items-start gap-4 sm:grid-cols-2">
										<div className="oncf-field">
											<Label htmlFor="registration-password">
												{t(Messages.auth.signup.password)}
											</Label>
											<Input
												id="registration-password"
												ref={passwordRef}
												value={password}
												type="password"
												aria-invalid={
													password.length > 0 && !isStrongPassword(password)
												}
												autoComplete="new-password"
												aria-describedby="registration-password-status"
												required
												maxLength={STRONG_PASSWORD_MAX_LENGTH}
												placeholder={t(
													Messages.auth.signup.passwordPlaceholder,
												)}
												onChange={(event) => setPassword(event.target.value)}
											/>
										</div>
										<div className="oncf-field">
											<Label htmlFor="registration-password-confirmation">
												{t(Messages.auth.signup.confirmPassword)}
											</Label>
											<Input
												id="registration-password-confirmation"
												ref={confirmationRef}
												value={confirmPassword}
												type="password"
												aria-invalid={
													confirmPassword.length > 0 &&
													confirmPassword !== password
												}
												autoComplete="new-password"
												aria-describedby="registration-confirmation-status"
												required
												maxLength={STRONG_PASSWORD_MAX_LENGTH}
												placeholder={t(
													Messages.auth.signup.confirmPasswordPlaceholder,
												)}
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
														? t(Messages.auth.signup.passwordMatch)
														: t(Messages.auth.signup.passwordMismatch)}
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
										{t(Messages.auth.signup.back)}
									</Button>
								)}
								<Button type="submit" disabled={register.isPending}>
									{step === 0
										? t(Messages.auth.signup.continue)
										: register.isPending
											? t(Messages.auth.signup.submitting)
											: t(Messages.auth.signup.requestAccess)}
								</Button>
							</div>
							<p className="text-center text-sm text-muted-foreground">
								{t(Messages.auth.signup.haveAccount)}{" "}
								<Link
									href="/login"
									className="underline underline-offset-4 hover:text-primary"
								>
									{t(Messages.auth.login.title)}
								</Link>
							</p>
						</footer>
					</>
				)}
			</form>
		</AuthPageLayout>
	);
}
