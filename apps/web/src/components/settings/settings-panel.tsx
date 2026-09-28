"use client";

import { isStrongPassword, STRONG_PASSWORD_HINT } from "@ecommand/shared";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuthControllerChangePassword } from "@/lib/api/auth";
import { useProfileControllerUpdate } from "@/lib/api/profile";
import { getFormErrorMessage } from "@/lib/form-utils";
import {
	type FontFamily,
	type MotionPreference,
	type TextSize,
	type ThemeMode,
	useAppearance,
	type WorkspaceLayout,
} from "@/providers/appearance-provider";
import { useAuth } from "@/providers/auth-provider";

const themeOptions: {
	value: ThemeMode;
	label: string;
	description: string;
}[] = [
	{
		value: "system",
		label: "System",
		description: "Follow your device setting",
	},
	{
		value: "light",
		label: "Warm light",
		description: "Warm neutral surfaces with orange accents",
	},
	{
		value: "dark",
		label: "Charcoal dark",
		description: "Low-glare charcoal surfaces and soft accents",
	},
	{
		value: "mono-light",
		label: "Monochrome light",
		description: "White surfaces, black text, and gray details",
	},
	{
		value: "mono-dark",
		label: "Monochrome dark",
		description: "Black surfaces, white text, and gray details",
	},
];

const fontOptions: { value: FontFamily; label: string; description: string }[] =
	[
		{ value: "inter", label: "Inter", description: "Crisp and familiar" },
		{ value: "geist", label: "Geist", description: "Clean and compact" },
		{
			value: "system",
			label: "System UI",
			description: "Use your device font",
		},
		{ value: "arial", label: "Arial", description: "Neutral sans serif" },
		{ value: "serif", label: "Georgia", description: "Traditional serif" },
		{
			value: "monospace",
			label: "Monospace",
			description: "Fixed-width lettering",
		},
	];

const textSizeOptions: {
	value: TextSize;
	label: string;
	description: string;
}[] = [
	{ value: "small", label: "Small", description: "Slightly smaller text" },
	{
		value: "default",
		label: "Default",
		description: "Recommended reading size",
	},
	{ value: "large", label: "Large", description: "Larger text throughout" },
];

const motionOptions: {
	value: MotionPreference;
	label: string;
	description: string;
}[] = [
	{
		value: "system",
		label: "Follow system",
		description: "Follow your device setting",
	},
	{
		value: "reduced",
		label: "Reduce motion",
		description: "Limit animation and transitions",
	},
];

const workspaceLayoutOptions: {
	value: WorkspaceLayout;
	label: string;
	description: string;
}[] = [
	{
		value: "sidebar",
		label: "Sidebar",
		description: "Keep navigation in the side rail",
	},
	{
		value: "centered-header",
		label: "Centered icon bar",
		description: "Place icon navigation above centered content",
	},
];

function PreferenceSelect<Value extends string>({
	id,
	label,
	value,
	options,
	onChange,
}: {
	id: string;
	label: string;
	value: Value;
	options: { value: Value; label: string; description: string }[];
	onChange: (value: Value) => void;
}) {
	const selected = options.find((option) => option.value === value);

	return (
		<div className="oncf-field min-w-0">
			<Label htmlFor={id}>{label}</Label>
			<Select
				value={value}
				onValueChange={(nextValue) => {
					const option = options.find((item) => item.value === nextValue);
					if (option) onChange(option.value);
				}}
			>
				<SelectTrigger id={id} className="w-full min-w-0">
					<SelectValue>{selected?.label}</SelectValue>
				</SelectTrigger>
				<SelectContent align="start" className="max-w-[calc(100vw-2rem)]">
					{options.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className="min-h-8 line-clamp-2 text-meta text-muted-foreground">
				{selected?.description}
			</p>
		</div>
	);
}

export type SettingsSection = "appearance" | "profile" | "security";

export function SettingsPanel({ section }: { section?: SettingsSection } = {}) {
	const { profile, setProfile } = useAuth();
	const {
		preferences,
		setTheme,
		setFontFamily,
		setTextSize,
		setMotion,
		setWorkspaceLayout,
	} = useAppearance();
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
	const [passwordMismatch, setPasswordMismatch] = useState(false);

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
		setPasswordMismatch(false);
		if (!isStrongPassword(newPassword)) {
			setPasswordError(STRONG_PASSWORD_HINT);
			document.getElementById("new-password")?.focus();
			return;
		}
		if (newPassword !== confirmNewPassword) {
			setPasswordMismatch(true);
			document.getElementById("confirm-new-password")?.focus();
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
			{!section && (
				<nav
					aria-label="Settings sections"
					className="flex flex-wrap gap-4 pb-4"
				>
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
			)}
			{(!section || section === "appearance") && (
				<Card
					id="appearance"
					className={`scroll-mt-8 ${section ? "border-0 bg-transparent py-0 shadow-none ring-0 [--card-spacing:0px]" : ""}`}
				>
					<CardHeader>
						<CardTitle>Appearance</CardTitle>
						<CardDescription>
							Set up colors, text, and motion for a comfortable workspace.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4">
						<div className="grid gap-4 @2xl/settings:grid-cols-2">
							<div className="grid content-start gap-4">
								<PreferenceSelect
									id="appearance-workspace-layout"
									label="Workspace layout"
									value={preferences.workspaceLayout}
									options={workspaceLayoutOptions}
									onChange={setWorkspaceLayout}
								/>
								<PreferenceSelect
									id="appearance-theme"
									label="Color theme"
									value={preferences.theme}
									options={themeOptions}
									onChange={setTheme}
								/>
							</div>
							<div className="grid content-start gap-4">
								<PreferenceSelect
									id="appearance-font"
									label="Font"
									value={preferences.fontFamily}
									options={fontOptions}
									onChange={setFontFamily}
								/>
								<PreferenceSelect
									id="appearance-text-size"
									label="Text size"
									value={preferences.textSize}
									options={textSizeOptions}
									onChange={setTextSize}
								/>
								<PreferenceSelect
									id="appearance-motion"
									label="Motion"
									value={preferences.motion}
									options={motionOptions}
									onChange={setMotion}
								/>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{(!section || section === "profile") && (
				<Card
					id="account"
					className={`scroll-mt-8 ${section ? "border-0 bg-transparent py-0 shadow-none ring-0 [--card-spacing:0px]" : ""}`}
				>
					<CardHeader>
						<CardTitle>Account details</CardTitle>
						<CardDescription>
							Update the name and email used for your ECommand account.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
							{profile.customerId !== null && (
								<div className="oncf-field min-w-0 sm:col-span-2">
									<p className="text-sm font-medium">Customer account</p>
									<div className="grid min-h-11 min-w-0 gap-1 rounded-md border border-input bg-background px-field py-control shadow-xs">
										<span className="truncate text-sm font-medium">
											{profile.customerName ??
												`Customer account #${profile.customerId}`}
										</span>
										{profile.customerCode && (
											<span className="text-meta text-muted-foreground">
												Customer code: {profile.customerCode}
											</span>
										)}
									</div>
								</div>
							)}
							<div className="oncf-field">
								<Label htmlFor="settings-first-name">First name</Label>
								<Input
									id="settings-first-name"
									value={firstName}
									placeholder="e.g. Samira"
									autoComplete="given-name"
									required
									onChange={(event) => {
										setFirstName(event.target.value);
										clearProfileFeedback();
									}}
								/>
							</div>
							<div className="oncf-field">
								<Label htmlFor="settings-last-name">Last name</Label>
								<Input
									id="settings-last-name"
									value={lastName}
									placeholder="e.g. El Amrani"
									autoComplete="family-name"
									required
									onChange={(event) => {
										setLastName(event.target.value);
										clearProfileFeedback();
									}}
								/>
							</div>
							<div className="oncf-field sm:col-span-2">
								<Label htmlFor="settings-email">Email address</Label>
								<Input
									id="settings-email"
									type="email"
									value={email}
									placeholder="name@company.com"
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
			)}

			{(!section || section === "security") && (
				<Card
					id="security"
					className={`scroll-mt-8 ${section ? "border-0 bg-transparent py-0 shadow-none ring-0 [--card-spacing:0px]" : ""}`}
				>
					<CardHeader>
						<CardTitle>Security</CardTitle>
						<CardDescription>
							Change your password to keep your account secure.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={changePassword} className="grid max-w-xl gap-4">
							<div className="oncf-field">
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
							<div className="oncf-field">
								<Label htmlFor="new-password">New password</Label>
								<Input
									id="new-password"
									type="password"
									aria-describedby="new-password-help"
									autoComplete="new-password"
									minLength={8}
									value={newPassword}
									required
									onChange={(event) => {
										setNewPassword(event.target.value);
										setPasswordMismatch(false);
									}}
								/>
								<p
									id="new-password-help"
									className="text-sm text-muted-foreground"
								>
									{STRONG_PASSWORD_HINT}
								</p>
							</div>
							<div className="oncf-field">
								<Label htmlFor="confirm-new-password">
									Confirm new password
								</Label>
								<Input
									id="confirm-new-password"
									type="password"
									autoComplete="new-password"
									value={confirmNewPassword}
									aria-invalid={passwordMismatch}
									aria-describedby={
										passwordMismatch ? "confirm-new-password-error" : undefined
									}
									required
									onChange={(event) => {
										setConfirmNewPassword(event.target.value);
										setPasswordMismatch(false);
									}}
								/>
								{passwordMismatch && (
									<p
										id="confirm-new-password-error"
										className="text-sm text-destructive"
										role="alert"
									>
										New passwords do not match.
									</p>
								)}
							</div>
							<div className="flex flex-wrap items-center gap-4">
								<Button
									type="submit"
									variant="outline"
									disabled={passwordMutation.isPending}
								>
									{passwordMutation.isPending
										? "Updating..."
										: "Change password"}
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
			)}
		</div>
	);
}
