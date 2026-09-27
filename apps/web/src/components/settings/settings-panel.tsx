"use client";

import { isStrongPassword, STRONG_PASSWORD_HINT } from "@ecommand/shared";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthControllerChangePassword } from "@/lib/api/auth";
import { useProfileControllerUpdate } from "@/lib/api/profile";
import { getFormErrorMessage } from "@/lib/form-utils";
import { type ThemeMode, useAppearance } from "@/providers/appearance-provider";
import { useAuth } from "@/providers/auth-provider";

const themeOptions: {
	value: ThemeMode;
	label: string;
	description: string;
	Icon: typeof SunIcon;
}[] = [
	{
		value: "system",
		label: "System",
		description: "Follow your device setting",
		Icon: MonitorIcon,
	},
	{
		value: "light",
		label: "Light",
		description: "Soft warm-neutral surfaces",
		Icon: SunIcon,
	},
	{
		value: "dark",
		label: "Dark",
		description: "Low-glare charcoal surfaces with muted orange accents",
		Icon: MoonIcon,
	},
];

export function SettingsPanel() {
	const { profile, setProfile } = useAuth();
	const { theme, setTheme } = useAppearance();
	const profileMutation = useProfileControllerUpdate();
	const passwordMutation = useAuthControllerChangePassword();
	const [firstName, setFirstName] = useState(profile.firstName);
	const [lastName, setLastName] = useState(profile.lastName);
	const [email, setEmail] = useState(profile.email);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [profileMessage, setProfileMessage] = useState("");
	const [passwordMessage, setPasswordMessage] = useState("");
	const [profileError, setProfileError] = useState("");
	const [passwordError, setPasswordError] = useState("");

	const profileIsDirty =
		firstName.trim() !== profile.firstName ||
		lastName.trim() !== profile.lastName ||
		email.trim() !== profile.email;

	useEffect(() => {
		setFirstName(profile.firstName);
		setLastName(profile.lastName);
		setEmail(profile.email);
	}, [profile.firstName, profile.lastName, profile.email]);

	function clearProfileFeedback() {
		setProfileMessage("");
		setProfileError("");
	}

	function saveProfile(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setProfileMessage("");
		setProfileError("");
		profileMutation.mutate(
			{
				data: {
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					email: email.trim(),
				},
			},
			{
				onSuccess: (updatedProfile) => {
					setProfile(updatedProfile);
					setProfileMessage("Your profile has been updated.");
				},
				onError: (error) =>
					setProfileError(
						getFormErrorMessage(error) ?? "Something went wrong. Try again.",
					),
			},
		);
	}

	function changePassword(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setPasswordMessage("");
		setPasswordError("");
		if (!isStrongPassword(newPassword)) {
			setPasswordError(STRONG_PASSWORD_HINT);
			return;
		}
		if (newPassword !== confirmNewPassword) {
			setPasswordError("New passwords do not match.");
			return;
		}
		passwordMutation.mutate(
			{ data: { currentPassword, newPassword } },
			{
				onSuccess: () => {
					setCurrentPassword("");
					setNewPassword("");
					setConfirmNewPassword("");
					setPasswordMessage("Your password has been changed.");
				},
				onError: (error) =>
					setPasswordError(
						getFormErrorMessage(error) ?? "Something went wrong. Try again.",
					),
			},
		);
	}

	return (
		<div className="grid max-w-5xl gap-6">
			<nav aria-label="Settings sections" className="flex flex-wrap gap-4 pb-4">
				<a
					className="shrink-0 rounded-md border px-4 py-4 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					href="#appearance"
				>
					Appearance
				</a>
				<a
					className="shrink-0 rounded-md border px-4 py-4 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					href="#account"
				>
					Account details
				</a>
				<a
					className="shrink-0 rounded-md border px-4 py-4 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					href="#security"
				>
					Security
				</a>
			</nav>
			<Card id="appearance" className="scroll-mt-8">
				<CardHeader>
					<CardTitle>Appearance</CardTitle>
					<CardDescription>
						Choose a comfortable color theme. Your choice is saved in this
						browser.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<RadioGroup
						aria-label="Color theme"
						value={theme}
						onValueChange={(value) => {
							if (value === "light" || value === "dark" || value === "system") {
								setTheme(value);
							}
						}}
						className="grid gap-4 sm:grid-cols-3"
					>
						{themeOptions.map(({ value, label, description, Icon }) => (
							<Label
								key={value}
								htmlFor={`theme-${value}`}
								className="flex min-h-24 cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/60 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5"
							>
								<RadioGroupItem id={`theme-${value}`} value={value} />
								<Icon
									className="size-4 self-center text-primary"
									aria-hidden="true"
								/>
								<span className="grid gap-compact">
									<span className="font-medium">{label}</span>
									<span className="text-sm text-muted-foreground">
										{description}
									</span>
								</span>
							</Label>
						))}
					</RadioGroup>
					<div className="pt-4 flex items-center gap-4 text-sm text-muted-foreground">
						<span className="size-3 rounded-full bg-primary" />
						<span className="size-3 rounded-full bg-accent" />
						<span>ONCF-inspired orange with softer neutral surfaces</span>
					</div>
				</CardContent>
			</Card>

			<Card id="account" className="scroll-mt-8">
				<CardHeader>
					<CardTitle>Account details</CardTitle>
					<CardDescription>
						Update the name and email used for your ECommand account.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
						<div className="grid gap-control">
							<Label htmlFor="settings-first-name">First name</Label>
							<Input
								id="settings-first-name"
								value={firstName}
								autoComplete="given-name"
								required
								onChange={(event) => {
									setFirstName(event.target.value);
									clearProfileFeedback();
								}}
							/>
						</div>
						<div className="grid gap-control">
							<Label htmlFor="settings-last-name">Last name</Label>
							<Input
								id="settings-last-name"
								value={lastName}
								autoComplete="family-name"
								required
								onChange={(event) => {
									setLastName(event.target.value);
									clearProfileFeedback();
								}}
							/>
						</div>
						<div className="grid gap-control sm:col-span-2">
							<Label htmlFor="settings-email">Email address</Label>
							<Input
								id="settings-email"
								type="email"
								value={email}
								autoComplete="email"
								required
								onChange={(event) => {
									setEmail(event.target.value);
									clearProfileFeedback();
								}}
							/>
						</div>
						<div className="flex flex-wrap items-center gap-4 sm:col-span-2">
							<Button
								type="submit"
								disabled={!profileIsDirty || profileMutation.isPending}
							>
								{profileMutation.isPending ? "Saving..." : "Save profile"}
							</Button>
							<Button
								type="button"
								variant="ghost"
								disabled={!profileIsDirty || profileMutation.isPending}
								onClick={() => {
									setFirstName(profile.firstName);
									setLastName(profile.lastName);
									setEmail(profile.email);
									setProfileMessage("");
									setProfileError("");
								}}
							>
								Discard changes
							</Button>
							{profileMessage && (
								<p role="status" className="text-sm text-primary">
									{profileMessage}
								</p>
							)}
							{profileError && (
								<p role="alert" className="text-sm text-destructive">
									{profileError}
								</p>
							)}
						</div>
					</form>
				</CardContent>
			</Card>

			<Card id="security" className="scroll-mt-8">
				<CardHeader>
					<CardTitle>Security</CardTitle>
					<CardDescription>
						Change your password to keep your account secure.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={changePassword} className="grid max-w-xl gap-4">
						<div className="grid gap-control">
							<Label htmlFor="current-password">Current password</Label>
							<Input
								id="current-password"
								type="password"
								autoComplete="current-password"
								value={currentPassword}
								required
								onChange={(event) => setCurrentPassword(event.target.value)}
							/>
						</div>
						<div className="grid gap-control">
							<Label htmlFor="new-password">New password</Label>
							<Input
								id="new-password"
								type="password"
								aria-describedby="new-password-help"
								autoComplete="new-password"
								minLength={8}
								value={newPassword}
								required
								onChange={(event) => setNewPassword(event.target.value)}
							/>
							<p
								id="new-password-help"
								className="text-sm text-muted-foreground"
							>
								{STRONG_PASSWORD_HINT}
							</p>
						</div>
						<div className="grid gap-control">
							<Label htmlFor="confirm-new-password">Confirm new password</Label>
							<Input
								id="confirm-new-password"
								type="password"
								autoComplete="new-password"
								value={confirmNewPassword}
								required
								onChange={(event) => setConfirmNewPassword(event.target.value)}
							/>
						</div>
						<div className="flex flex-wrap items-center gap-4">
							<Button
								type="submit"
								variant="outline"
								disabled={passwordMutation.isPending}
							>
								{passwordMutation.isPending ? "Updating..." : "Change password"}
							</Button>
							{passwordMessage && (
								<p role="status" className="text-sm text-primary">
									{passwordMessage}
								</p>
							)}
							{passwordError && (
								<p role="alert" className="text-sm text-destructive">
									{passwordError}
								</p>
							)}
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
