"use client";

import { isStrongPassword, STRONG_PASSWORD_HINT } from "@ecommand/shared";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";

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
import { useAppearanceSyncStatus } from "@/providers/appearance-preferences-sync";
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
		{ value: "system", label: "System", description: "Use your device font" },
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
		label: "System",
		description: "Follow your device setting",
	},
	{
		value: "reduced",
		label: "Reduced",
		description: "Use only essential motion",
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

function PreferenceChoices<Value extends string>({
	label,
	value,
	options,
	onChange,
	renderPreview,
	columns = "grid-cols-2 xl:grid-cols-3",
	compact = false,
}: {
	label: string;
	value: Value;
	options: { value: Value; label: string; description: string }[];
	onChange: (value: Value) => void;
	renderPreview?: (value: Value) => ReactNode;
	columns?: string;
	compact?: boolean;
}) {
	const id = label.toLowerCase().replaceAll(" ", "-");
	const inlineChoices = compact && !renderPreview;

	return (
		<fieldset className="grid">
			<legend className="text-sm font-medium">{label}</legend>
			<RadioGroup
				aria-label={label}
				value={value}
				onValueChange={(nextValue) => {
					const option = options.find((item) => item.value === nextValue);
					if (option) onChange(option.value);
				}}
				className={
					inlineChoices
						? "mt-4 flex flex-wrap gap-control"
						: `mt-4 grid gap-control ${columns}`
				}
			>
				{options.map((option) => (
					<Label
						key={option.value}
						htmlFor={`${id}-${option.value}`}
						className={`flex cursor-pointer items-center ${compact && renderPreview ? "gap-compact" : "gap-control"} rounded-lg border px-field py-control transition-colors hover:bg-muted/60 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5 ${inlineChoices ? "min-h-11 rounded-md px-3" : compact ? "min-h-12" : "min-h-14"}`}
					>
						<RadioGroupItem id={`${id}-${option.value}`} value={option.value} />
						{renderPreview?.(option.value)}
						<span className="grid min-w-0 flex-1 gap-compact">
							<span
								className={`${renderPreview ? "text-xs sm:text-sm" : "text-sm"} font-medium`}
							>
								{option.label}
							</span>
							<span
								className={
									compact ? "sr-only" : "text-xs text-muted-foreground"
								}
							>
								{option.description}
							</span>
						</span>
					</Label>
				))}
			</RadioGroup>
		</fieldset>
	);
}

type PreviewTheme = Exclude<ThemeMode, "system">;

function ThemeSurface({ theme }: { theme: PreviewTheme }) {
	const isDark = theme === "dark" || theme === "mono-dark";

	return (
		<span
			data-theme={theme}
			className={`grid min-w-0 grid-cols-[0.6fr_1.4fr] ${isDark ? "dark" : ""}`}
		>
			<span className="bg-sidebar" />
			<span className="grid content-center gap-1 bg-background p-1">
				<span className="h-1 w-5 rounded-full bg-muted-foreground/40" />
				<span className="h-2 rounded-sm border border-border bg-card" />
				<span className="h-1 w-3/4 rounded-full bg-primary" />
			</span>
		</span>
	);
}

function ThemePreview({ theme }: { theme: ThemeMode }) {
	const previews: PreviewTheme[] =
		theme === "system" ? ["light", "dark"] : [theme];

	return (
		<span
			aria-hidden="true"
			className={`grid h-8 w-8 shrink-0 overflow-hidden rounded-md border border-border sm:w-12 ${theme === "system" ? "grid-cols-2" : "grid-cols-1"}`}
		>
			{previews.map((previewTheme) => (
				<ThemeSurface key={previewTheme} theme={previewTheme} />
			))}
		</span>
	);
}

export type SettingsSection = "appearance" | "profile" | "security";

export function SettingsPanel({ section }: { section?: SettingsSection } = {}) {
	const { profile, setProfile } = useAuth();
	const appearanceSyncStatus = useAppearanceSyncStatus();
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
						<PreferenceChoices
							label="Workspace layout"
							value={preferences.workspaceLayout}
							options={workspaceLayoutOptions}
							onChange={setWorkspaceLayout}
							columns="grid-cols-2"
							compact
						/>
						<PreferenceChoices
							label="Color theme"
							value={preferences.theme}
							options={themeOptions}
							onChange={setTheme}
							renderPreview={(theme) => <ThemePreview theme={theme} />}
							columns="grid-cols-1 xs:grid-cols-2 xl:grid-cols-3"
							compact
						/>
						<PreferenceChoices
							label="Font"
							value={preferences.fontFamily}
							options={fontOptions}
							onChange={setFontFamily}
							compact
						/>
						<PreferenceChoices
							label="Text size"
							value={preferences.textSize}
							options={textSizeOptions}
							onChange={setTextSize}
							compact
						/>
						<PreferenceChoices
							label="Motion"
							value={preferences.motion}
							options={motionOptions}
							onChange={setMotion}
							compact
						/>
						<p role="status" className="text-sm text-muted-foreground">
							{appearanceSyncStatus === "loading" &&
								"Loading your account appearance settings…"}
							{appearanceSyncStatus === "saving" &&
								"Saving appearance settings to your account…"}
							{appearanceSyncStatus === "saved" &&
								"Appearance settings are synced to your account."}
							{appearanceSyncStatus === "local" &&
								"Saved on this device. Account sync is temporarily unavailable."}
						</p>
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
									onChange={(event) => setNewPassword(event.target.value)}
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
									required
									onChange={(event) =>
										setConfirmNewPassword(event.target.value)
									}
								/>
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
